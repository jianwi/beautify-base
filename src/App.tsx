import "./App.css";
import { useEffect, useState } from "react";
import { Spin, Button, Radio, RadioGroup } from "@douyinfe/semi-ui";
import { Typography } from '@douyinfe/semi-ui';
import { useTranslation } from "react-i18next";
import { FieldType, IFieldMeta, IGridView, IRecord, ITable, IView, ViewType, bitable, IOpenSegment, IOpenSingleSelect, IOpenUser, IOpenFormulaCellValue, IOpenMultiSelect, IOpenLocation, IOpenTimestamp, IDateTimeFieldMeta, NumberFormatter, IOpenNumber, INumberFieldMeta } from "@lark-base-open/js-sdk";
import moment from "moment";

export default function App() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<string>("header");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<IView | null>(null);
  const [currentViewType, setCurrentViewType] = useState<ViewType | null>(null);
  const [currentTable, setCurrentTable] = useState<ITable | null>(null);
  const { Text } = Typography;

  useEffect(() => {
    setLoading(true)
    bitable.base.getSelection().then((selection) => {
      bitable.base.getTableById(selection.tableId!).then((table) => {
        table.getViewById(selection.viewId!).then((view) => {
          setCurrentView(view);
          setCurrentTable(table);
          view.getType().then((type) => {
            setCurrentViewType(type);
          });
        });
      });
    }).finally(() => setLoading(false));
  }, []);

  bitable.base.onSelectionChange((event) => {
    let data = event.data
    if (data.tableId && data.viewId) {
      setLoading(true)
      bitable.base.getSelection().then((selection) => {
        bitable.base.getTableById(selection.tableId!).then((table) => {
          table.getViewById(selection.viewId!).then((view) => {
            setCurrentView(view);
            setCurrentTable(table);
            view.getType().then((type) => {
              setCurrentViewType(type);
            });
          });
        });
      }).finally(() => setLoading(false));
    }
  });

  async function beautify() {
    setLoading(true);
    if (mode === "header") {
      await beautifyByHeader();
    } else {
      await beautifyByContent();
    }
    setLoading(false);
  }

  async function beautifyByContent() {
    const fields = await currentTable?.getFieldMetaList();
    console.log(fields);
    const records = await currentTable?.getRecords({ pageSize: 10 });
    console.log(records);
    for (let field of fields!) {
      let fieldWidth = 20;
      for (let record of records?.records!) {
        fieldWidth = Math.max(fieldWidth, await getFieldContentWidth(field, record));
      }
      await (currentView as IGridView).setFieldWidth(field.id, fieldWidth);
    }
  }

  async function beautifyByHeader() {
    const fields = await currentTable?.getFieldMetaList();
    for (let field of fields!) {
      await (currentView as IGridView).setFieldWidth(field.id, await getFieldHeaderWidth(field));
    }
  }

  async function getFieldContentWidth(field: IFieldMeta, record: IRecord) {
    let width = 20;
    if (record && record.fields) {
      switch (field.type) {
        case FieldType.Text:
          if (record.fields[field.id]) {
            for (let segment of record.fields[field.id] as IOpenSegment[]) {
              width = Math.max(width, getTextWidth(segment.text) + 20);
            }
          }
          break;
        case FieldType.Location:
          width = Math.max(width, getTextWidth((record.fields[field.id] as IOpenLocation).name) + 20);
          break;
        case FieldType.Number:
          if (record.fields[field.id]) {
            width = Math.max(width, getTextWidth(formatNumber((record.fields[field.id] as IOpenNumber), field as INumberFieldMeta)) + 40);
          }
          break;
        case FieldType.DateTime:
        case FieldType.CreatedTime:
        case FieldType.ModifiedTime:
          if (record.fields[field.id] && (record.fields[field.id] as IOpenTimestamp) > 0) {
            width = Math.max(width, getTextWidth(formatDatetime((record.fields[field.id] as IOpenTimestamp), field as IDateTimeFieldMeta)) + 20);
          }
          break;
        case FieldType.SingleSelect:
          if (record.fields[field.id]) {
            width = Math.max(width, getTextWidth((record.fields[field.id] as IOpenSingleSelect).text) + 40);
          }
          break;
        case FieldType.MultiSelect:
          if (record.fields[field.id]) {
            for (let segment of record.fields[field.id] as IOpenMultiSelect) {
              if (segment) { width += 20 + getTextWidth(segment.text); }
            }
          }
          break;
        case FieldType.User:
        case FieldType.ModifiedUser:
        case FieldType.CreatedUser:
          if (record.fields[field.id]) {
            for (let user of record.fields[field.id] as IOpenUser[]) {
              if (user) { width += 40 + getTextWidth(user.name!); }
            }
          }
          break;
        case FieldType.Formula:
          currentTable?.getCellString(field.id, record.recordId).then((cellValue) => {
            width = Math.max(width, getTextWidth(cellValue) + 20);
          });
          break;
        default:
          break;
      }
    }
    return Math.max(width, await getFieldHeaderWidth(field));
  }

  function formatDatetime(timestamp: number, field: IDateTimeFieldMeta) {
    let datetimeString = moment(timestamp).format(field.property.dateFormat);
    if (field.property.displayTimeZone) {
      datetimeString += '(GTM+00)';
    }
    return datetimeString;
  }

  function formatNumber(value: number, field: INumberFieldMeta): string {
    switch (field.property.formatter) {
      case NumberFormatter.INTEGER:
        return Math.round(value).toLocaleString();
      case NumberFormatter.DIGITAL_ROUNDED_1:
        return value.toFixed(1);
      case NumberFormatter.DIGITAL_ROUNDED_2:
        return value.toFixed(2);
      case NumberFormatter.DIGITAL_ROUNDED_3:
        return value.toFixed(3);
      case NumberFormatter.DIGITAL_ROUNDED_4:
        return value.toFixed(4);
      case NumberFormatter.DIGITAL_THOUSANDS:
        return Math.round(value).toLocaleString('en-US');
      case NumberFormatter.DIGITAL_THOUSANDS_DECIMALS:
        return value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case NumberFormatter.PERCENTAGE_ROUNDED:
        return (value * 100).toFixed(0) + '%';
      case NumberFormatter.PERCENTAGE:
        return (value * 100).toFixed(2) + '%';
      default:
        return value.toString();
    }
  }

  async function getFieldHeaderWidth(field: IFieldMeta) {
    const fieldName = await field.name;
    const fieldNameWidth = getTextWidth(fieldName!);
    let fieldWidth = Math.ceil(fieldNameWidth + 40);
    if (await field.isPrimary) {
      fieldWidth += 20;
    }
    return fieldWidth
  }

  function getTextWidth(text: string): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = "14px PingFang SC";
      const metrics = context.measureText(text);
      return metrics.width;
    }
    return 0;
  }

  return (
    <main className="container">
      <Spin spinning={loading}>
        {currentViewType && currentViewType === ViewType.Grid ? (
          <div>
            <RadioGroup direction="vertical" onChange={(e) => setMode(e.target.value)} value={mode} >
              <Radio value={"header"}>按表头自适应</Radio>
              <Radio value={"content"}>按内容自适应</Radio>
            </RadioGroup>
            <br />
            <Button onClick={beautify} theme="solid" className="button">一键美化</Button>
          </div>
        ) : (
          <Text type="secondary">请选择一个表格视图</Text>
        )}
      </Spin>
    </main>
  );
}
