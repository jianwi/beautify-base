import "./App.css";
import { useEffect, useState } from "react";
import { Spin, Button, Space } from "@douyinfe/semi-ui";
import { Typography } from '@douyinfe/semi-ui';
import { useTranslation } from "react-i18next";
import { IGridView, ITable, IView, ViewType, bitable } from "@lark-base-open/js-sdk";
import { getFieldContentWidth, getFieldHeaderWidth } from "./utils/widthCalculator";

export default function App() {
  const { t } = useTranslation();
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

  function syncToAllViews() {
    currentTable?.getViewList().then((views) => {
      for (let view of views) {
        view.getType().then((type) => {
          if (type === ViewType.Grid && currentViewType === ViewType.Grid && view.id != currentView?.id) {
          }
        });
      }
    });
  }

  async function beautify(mode: string) {
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
    const records = await currentTable?.getRecords({ pageSize: 30 });
    for (let field of fields!) {
      let fieldWidth = 20;
      for (let record of records?.records!) {
        fieldWidth = Math.max(fieldWidth, await getFieldContentWidth(field, record));
      }
      await setFieldWidth(field.id, fieldWidth);
    }
  }

  async function beautifyByHeader() {
    const fields = await currentTable?.getFieldMetaList();
    for (let field of fields!) {
      const targetWidth = await getFieldHeaderWidth(field);
      await setFieldWidth(field.id, targetWidth);
    }
  }

  async function setFieldWidth(fieldId: string, width: number) {
    width = Math.min(400, width);
    // 兼容11.2版本bug，11.3发布后去掉
    //@ts-ignore
    await (currentView as IGridView).setFieldWidth(fieldId, width.toString());
    await (currentView as IGridView).setFieldWidth(fieldId, width);
  }

  return (
    <main className="container">
      <Spin spinning={loading}>
        {currentViewType && currentViewType === ViewType.Grid ? (
          <Space vertical={true}>
            <Button onClick={() => beautify("content")} theme="solid" className="button" loading={loading}>
              {t('button.beautifyByContent')}
            </Button>
            <Button onClick={() => beautify("header")} theme="solid" className="button" loading={loading}>
              {t('button.beautifyByHeader')}
            </Button>
            <Button onClick={() => syncToAllViews()} theme="solid" className="button" loading={loading}>
              {t('button.syncToAllViews')}
            </Button>
          </Space>
        ) : (
          <Text type="secondary">请选择一个表格视图</Text>
        )}
      </Spin>
    </main>
  );
}
