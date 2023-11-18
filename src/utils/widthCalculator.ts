import moment from "moment";
import {
  bitable,
  IFieldMeta,
  FieldType,
  IRecord,
  IOpenUrlSegment,
  IOpenSegment,
  IOpenLocation,
  IOpenNumber,
  INumberFieldMeta,
  IOpenTimestamp,
  IDateTimeFieldMeta,
  IOpenSingleSelect,
  IOpenMultiSelect,
  IOpenUser,
  NumberFormatter,
  IOpenAutoNumber,
  IOpenLink,
  IOpenGroupChat,
  IOpenPhone,
} from "@lark-base-open/js-sdk";

/** 计算字段标题宽度 */
export async function getFieldHeaderWidth(field: IFieldMeta) {
  const fieldName = await field.name;
  const fieldNameWidth = getTextWidth(fieldName!);
  let fieldWidth = Math.ceil(fieldNameWidth + 50);
  if (await field.isPrimary) {
    fieldWidth += 20;
  }
  return fieldWidth;
}

/** 计算字段内容宽度 */
export async function getFieldContentWidth(field: IFieldMeta, record: IRecord) {
  let width = 20;
  const lang = await bitable.bridge.getLanguage();
  if (record && record.fields) {
    if (record.fields[field.id]) {
      switch (field.type) {
        case FieldType.Url:
          for (let url of record.fields[field.id] as IOpenUrlSegment[]) {
            width = Math.max(width, getTextWidth(url.text) + 40);
          }
          break;
        case FieldType.Text:
          for (let segment of record.fields[field.id] as IOpenSegment[]) {
            width = Math.max(width, getTextWidth(segment.text) + 20);
          }
          break;
        case FieldType.Location:
          width = Math.max(
            width,
            getTextWidth((record.fields[field.id] as IOpenLocation).name) + 20
          );
          break;
        case FieldType.Number:
          width = Math.max(
            width,
            getTextWidth(
              formatNumber(
                record.fields[field.id] as IOpenNumber,
                field as INumberFieldMeta
              )
            ) + 40
          );
          break;
        case FieldType.DateTime:
        case FieldType.CreatedTime:
        case FieldType.ModifiedTime:
          if ((record.fields[field.id] as IOpenTimestamp) > 0) {
            width = Math.max(
              width,
              getTextWidth(
                formatDatetime(
                  record.fields[field.id] as IOpenTimestamp,
                  field as IDateTimeFieldMeta
                )
              ) + 20
            );
          }
          break;
        case FieldType.SingleSelect:
          width = Math.max(
            width,
            getTextWidth((record.fields[field.id] as IOpenSingleSelect).text) +
              40
          );
          break;
        case FieldType.MultiSelect:
          for (let segment of record.fields[field.id] as IOpenMultiSelect) {
            if (segment) {
              width += 20 + getTextWidth(segment.text);
            }
          }
          break;
        case FieldType.User:
        case FieldType.ModifiedUser:
        case FieldType.CreatedUser:
          for (let user of record.fields[field.id] as IOpenUser[]) {
            if (user) {
              if (lang === "en") {
                width += 40 + getTextWidth(user.enName!);
              } else {
                width += 40 + getTextWidth(user.name!);
              }
            }
          }
          break;
        case FieldType.GroupChat:
          for (let group of record.fields[field.id] as IOpenGroupChat[]) {
            if (group) {
              width += 40 + getTextWidth(group.name!);
            }
          }
          break;
        case FieldType.AutoNumber:
          width = Math.max(
            width,
            getTextWidth((record.fields[field.id] as IOpenAutoNumber).value) +
              20
          );
          break;
        case FieldType.SingleLink:
        case FieldType.DuplexLink:
          const recordCount = (record.fields[field.id] as IOpenLink).recordIds.length;
          width = Math.max(
            width,
            getTextWidth((record.fields[field.id] as IOpenLink).text) + 20 + 20 * recordCount
          );
          break;
        case FieldType.Phone:
          width = Math.max(
            width,
            getTextWidth((record.fields[field.id] as IOpenPhone)) + 20
          );
        default:
          width = Math.max(width, await getFieldHeaderWidth(field));
          break;
      }
    }
  }
  return Math.min(width, 400);
}

function formatDatetime(timestamp: number, field: IDateTimeFieldMeta) {
  let datetimeString = moment(timestamp).format(field.property.dateFormat);
  if (field.property.displayTimeZone) {
    datetimeString += "(GTM+00)";
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
      return Math.round(value).toLocaleString("en-US");
    case NumberFormatter.DIGITAL_THOUSANDS_DECIMALS:
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case NumberFormatter.PERCENTAGE_ROUNDED:
      return (value * 100).toFixed(0) + "%";
    case NumberFormatter.PERCENTAGE:
      return (value * 100).toFixed(2) + "%";
    default:
      return value.toString();
  }
}

function getTextWidth(text: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  let width = 0;
  if (context) {
    context.font = "14px PingFang SC";
    for (let segment of text.split("\n")) {
      if (segment) {
        const metrics = context.measureText(segment);
        width = Math.max(width, metrics.width);
      }
    }
  }
  return width;
}
