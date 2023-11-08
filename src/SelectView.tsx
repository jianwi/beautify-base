import { Spin, Form, Button, Modal } from "@douyinfe/semi-ui";
import { useEffect, useState, useRef } from "react";
import { ITableMeta, IViewMeta, SharingStatus, ViewType, bitable } from "@lark-base-open/js-sdk";
import { useTranslation } from "react-i18next";

interface SelectViewProps {
    setUrl: (url: string) => void;
    setSettingVisible: (visible: boolean) => void;
}

export default function SelectView({ setUrl, setSettingVisible }: SelectViewProps) {
    const [tableId, setTableId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
    const [tableMetaList, setTableMetaList] = useState<ITableMeta[]>();
    const [viewMetaList, setViewMetaList] = useState<IViewMeta[]>();
    const formApi = useRef<any>();
    const { t } = useTranslation();

    useEffect(() => {
        setLoading(true);
        bitable.base.getTableMetaList().then(async (r) => {
            setTableMetaList(r.filter(({ name }) => name));
            const choosedTableId = (await bitable.base.getSelection()).tableId;
            formApi.current.setValues({
                tableId: choosedTableId,
            });
            setTableId(choosedTableId!);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!tableId) {
            return;
        }
        setLoading(true);
        formApi.current.setValue("viewId", "");
        bitable.base.getTableById(tableId).then((table) => {
            table.getViewMetaList().then((views) => {
                setViewMetaList(views.filter(({ type }) => type != ViewType.WidgetView && type != ViewType.Form));
                setLoading(false);
            });
        });
    }, [tableId]);

    function onFormChange() {
        setBtnDisabled(!formApi.current.getValues().viewId);
    }

    function onClickStart() {
        setLoading(true);
        bitable.base.getTableById(formApi.current.getValues().tableId).then((table) => {
            table.getViewById(formApi.current.getValues().viewId).then((view) => {
                view.getSharingStatus().then((status) => {
                    if (status == SharingStatus.Enabled) {
                        view.getShareLink().then((link) => {
                            setUrl(link);
                            localStorage.setItem('BASE_PREVIEW_URL', link);
                            setSettingVisible(false);
                            setLoading(false);
                        });
                    } else {
                        Modal.confirm({
                            title: t('title.confirmShare'),
                            content: t('content.confirmShare'),
                            okText: t('button.confirm'),
                            cancelText: t('button.cancel'),
                            onCancel: () => {
                                setLoading(false);
                            },
                            onOk: () => {
                                view.enableSharing().then(() => {
                                    view.getShareLink().then((link) => {
                                        setUrl(link);
                                        localStorage.setItem('BASE_PREVIEW_URL', link);
                                        setSettingVisible(false);
                                        setLoading(false);
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });
    }
    return (
        <Spin spinning={loading}>
            <Form
                onChange={onFormChange}
                disabled={loading}
                getFormApi={(e) => {
                    formApi.current = e;
                }}
            >
                <Form.Select
                    onChange={(tableId) => setTableId(tableId as string)}
                    field="tableId"
                    label={t("select.table")}
                >
                    {Array.isArray(tableMetaList) &&
                        tableMetaList.map(({ id, name }) => (
                            <Form.Select.Option key={id} value={id}>
                                <div className="semi-select-option-text">{name}</div>
                            </Form.Select.Option>
                        ))}
                </Form.Select>
                <Form.Select field="viewId" label={t("select.view")}>
                    {Array.isArray(viewMetaList) &&
                        viewMetaList.map(({ id, name }) => (
                            <Form.Select.Option key={id} value={id}>
                                <div className="semi-select-option-text">{name}</div>
                            </Form.Select.Option>
                        ))}
                </Form.Select>
            </Form>
            <br />
            <Button
                disabled={btnDisabled}
                type="primary"
                className="bt1"
                onClick={onClickStart}
            >
                {t("button.confirm")}
            </Button>
        </Spin>
    );
}
