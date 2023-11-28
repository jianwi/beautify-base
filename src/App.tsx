import "./App.css";
import {useEffect, useState} from "react";
import {Spin, Input, Button, Space, Tabs, TabPane, Checkbox, CheckboxGroup, Toast, Select} from "@douyinfe/semi-ui";
import {Typography} from '@douyinfe/semi-ui';
import {useTranslation} from "react-i18next";
import {IGridView, ITable, IView, ViewType, bitable} from "@lark-base-open/js-sdk";
import {IconDelete, IconEyeOpened, IconEyeClosed} from "@douyinfe/semi-icons"
import {getFieldContentWidth, getFieldHeaderWidth} from "./utils/widthCalculator";

function Flex(props) {
    return <div style={{
        display: "flex",
        width: "100%",
        maxWidth: "500px",
        ...props.style
    }}>
        {props.children}
    </div>
}

Flex.Row = function (props) {
    return <div style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        maxWidth: "500px",
        ...props.style
    }}>
        {props.children}
    </div>
}
Flex.Col = function (props) {
    return <div style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "500px",
        ...props.style
    }}>
        {props.children}
    </div>
}

function BeautyView({currentView, currentTable}) {
    const [loading, setLoading] = useState<boolean>(false);
    const {t} = useTranslation();

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
        const records = await currentTable?.getRecords({pageSize: 30});
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

    return (<Space vertical={true}>
            <Button onClick={() => beautify("content")} theme="solid" className="button" loading={loading}>
                {t('button.beautifyByContent')}
            </Button>
            <Button onClick={() => beautify("header")} theme="solid" className="button" loading={loading}>
                {t('button.beautifyByHeader')}
            </Button>
            {/* <Button onClick={() => syncToAllViews()} theme="solid" className="button" loading={loading}>
              {t('button.syncToAllViews')}
            </Button> */}
        </Space>
    )
}

function ModifyView({currentView, currentTable}) {
    const {t} = useTranslation();
    const [fields, setFields] = useState([])
    const [filterFields, setFilterFields] = useState([])
    const [selectedFields, setSelectedFields] = useState([])
    const [fieldTypes, setFieldTypes] = useState([])

    useEffect(() => {
        getFields()
    }, [currentView])


    async function getFields() {
        let view = currentView
        let fields = await view.getFieldMetaList()
        let visible = await view.getVisibleFieldIdList()
        let types = []
        fields = fields.map(f => {
            f.visable = visible.indexOf(f.id) > -1
            if (!types.some(t => t.value === f.type)) {
                types.push({
                    label: t(`field.type.${f.type}`),
                    value: f.type
                })
            }
            return f
        })
        setFieldTypes(types)
        setFields(fields)
        setFilterFields(fields)

    }

    async function showField(id: string) {
        if (await currentView.showField(id)) {
            let newFields = fields.map(f => {
                if (f.id === id) {
                    f.visable = true
                }
                return f
            })
            let newFilterFields = filterFields.map(f => {
                if (f.id === id) {
                    f.visable = true
                }
                return f
            })
            setFields(newFields)
            setFilterFields(newFilterFields)
        }
    }

    async function hideField(id) {
        if (await currentView.hideField(id)) {
            let newFields = fields.map(f => {
                if (f.id === id) {
                    f.visable = false
                }
                return f
            })
            let newFilterFields = filterFields.map(f => {
                if (f.id === id) {
                    f.visable = false
                }
                return f
            })
            setFields(newFields)
            setFilterFields(newFilterFields)
        }
    }


    return <>
        <div>
            <Select
                multiple
                onChange={(types: string[]) => {
                    console.log(types)
                    if (!types || types.length === 0) {
                        setFilterFields(fields)
                        return
                    }
                    let newFields = fields.filter(f => {
                        return types.indexOf(f.type) > -1
                    })
                    console.log("查找新的", newFields)
                    setFilterFields(newFields)
                }} style={{maxWidth: "400px", marginBottom: "3px"}} optionList={fieldTypes}
                insetLabel={t('filterByType')}></Select>
        </div>
        <Input
            style={{
                maxWidth: "400px",
            }}
            insetLabel={t('filterByName')} onChange={(value) => {
            if (!value) {
                setFilterFields(fields)
                return
            }
            let newFields = fields.filter(f => {
                return f.name.indexOf(value) > -1
            })
            console.log("查找新的", value, newFields)
            setFilterFields(newFields)
        }}></Input>
        <div style={{
            marginTop: "6px",
            marginBottom: "6px",
            height: "3px",
            background: "#eee",
            maxWidth: "400px",
        }}></div>

        <CheckboxGroup value={selectedFields}
                       style={{
                           rowGap: "0px",
                       }}
                       onChange={(v) => {
                           setSelectedFields(v)
                       }}>

            {
                filterFields.map(f => {
                    return <Flex.Row style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        maxWidth: "400px",
                        margin: "3px 0",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                        background: "#f5f5f5",
                    }}>
                        <Checkbox style={{flex: 1,}} key={f.id} value={f.id}>
                                <span style={{
                                    color: f.visable ? "black" : "gray"
                                }}>{f.name}</span>
                        </Checkbox>
                        <Flex.Row
                            style={{
                                width: "fit-content",
                            }}>
                            <Button
                                style={{
                                    marginRight: "10px"
                                }}
                                icon={<IconDelete/>}
                                onClick={() => {
                                    currentTable.deleteField(f.id).then(() => {
                                        Toast.success(t('toast.deleteSuccess'))
                                        getFields()
                                    }).catch(() => {
                                        Toast.error(t('toast.deleteFail'))
                                    })

                                }} type={'danger'}/>
                            {
                                f.visable ?
                                    <Button onClick={() => {
                                        hideField(f.id)
                                    }} icon={<IconEyeOpened/>}
                                    /> :
                                    <Button onClick={() => {
                                        showField(f.id)
                                    }} icon={
                                        <IconEyeClosed/>
                                    }/>
                            }
                        </Flex.Row>
                    </Flex.Row>
                })
            }
        </CheckboxGroup>
        <Flex.Row
            style={{
                alignItems: "center",
                width: "400px",
                margin: "3px 0",
                padding: "6px 10px",
                borderRadius: "4px",
                boxSizing: "border-box",
                background: "#f5f5f5",

            }}
        >

            <Checkbox onChange={(e) => {
                if (e.target.checked) {
                    setSelectedFields(filterFields.map(f => f.id))
                } else {
                    setSelectedFields([])
                }
            }} checked={selectedFields.length === filterFields.length}/>
            <Button
                style={{
                    margin: "0 10px",
                }}
                onClick={() => {
                    let ids = selectedFields
                    if (ids.length === 0) {
                        return
                    }
                    ids.forEach(id => {
                        hideField(id)
                    })

            }}>批量隐藏</Button>
            <Button onClick={() => {
                let ids = selectedFields
                if (ids.length === 0) {
                    return
                }
                ids.forEach(id => {
                    showField(id)
                })

            }}>批量显示</Button>
        </Flex.Row>
    </>

}


export default function App() {
    const {t} = useTranslation();
    const [loading, setLoading] = useState<boolean>(true);
    const [currentView, setCurrentView] = useState<IView | null>(null);
    const [currentViewType, setCurrentViewType] = useState<ViewType | null>(null);
    const [currentTable, setCurrentTable] = useState<ITable | null>(null);
    const {Text} = Typography;
    const [viewName, setViewName] = useState<string>("");


    function getSelection() {
        setLoading(true)
        bitable.base.getSelection().then((selection) => {
            bitable.base.getTableById(selection.tableId!).then((table) => {
                table.getViewById(selection.viewId!).then((view) => {
                    setCurrentView(view);
                    setCurrentTable(table);
                    view.getType().then((type) => {
                        setCurrentViewType(type);
                    });
                    view.getName().then((name) => {
                        setViewName(name)
                    })
                });
            });
        }).finally(() => setLoading(false));
    }

    useEffect(() => {
        return () => {
            getSelection();

            bitable.base.onSelectionChange((event) => {
                let data = event.data
                if (data.tableId && data.viewId) {
                    getSelection()
                }
            });
        }
    }, []);

    if (loading) {
        return (
            <main className="container">
                <Spin spinning={loading}>
                    <Text type="secondary">Loading...</Text>
                </Spin>
            </main>
        );
    }

    if (currentViewType && currentViewType === ViewType.Grid) {
        return (
            <div style={{
                padding: "0 20px"
            }}>
                <Text type="secondary">{t('text.currentView')}: {viewName}</Text>
                <Tabs type="line" defaultActiveKey={'1'}>
                    <TabPane tab={t('tab.modify')} itemKey="1">
                        <ModifyView currentView={currentView} currentTable={currentTable}/>
                    </TabPane>
                    <TabPane tab={t('tab.beauty')} itemKey="2">
                        <BeautyView currentView={currentView} currentTable={currentTable}/>
                    </TabPane>

                </Tabs>
            </div>

        );
    } else {
        return (
            <main className="container">
                (<Text type="secondary">请选择一个表格视图</Text>)
            </main>
        );
    }
}

