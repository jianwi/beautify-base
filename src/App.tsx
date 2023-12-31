import "./App.css";
import {useEffect, useState} from "react";
import {
    Spin,
    Divider,
    Input,
    Card,
    Row,
    Col,
    Button,
    Space,
    Checkbox,
    CheckboxGroup,
    Toast,
    Select,
    Modal, ButtonGroup, Tag, Popconfirm, Banner
} from "@douyinfe/semi-ui";
import {Typography} from '@douyinfe/semi-ui';
import {useTranslation} from "react-i18next";
import {IGridView, ITable, IView, ViewType, bitable} from "@lark-base-open/js-sdk";
import {
    IconDelete,
    IconEyeOpened,
    IconEyeClosed,
    IconEdit,
    IconSearch,
    IconFile,
    IconFilter, IconMarginLeftStroked, IconRefresh
} from "@douyinfe/semi-icons"
import {getFieldContentWidth, getFieldHeaderWidth} from "./utils/widthCalculator";


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

    async function beautifyByHeader(fieldIds: string[] = []) {
        let fields = await currentTable?.getFieldMetaList();
        if (fieldIds.length > 0) {
            fields = fields?.filter(f => {
                return fieldIds.indexOf(f.id) > -1
            })
        }

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
        </Space>
    )
}

function EditField({showEditFieldModal, setShowEditFieldModal, editFieldInfo, editField}) {
    const [newName, setNewName] = useState(editFieldInfo.name)
    const {t} = useTranslation();

    useEffect(() => {
        setNewName(editFieldInfo.name)
    }, [editFieldInfo])

    return <>
        <Modal
            width={300}
            title={t('modal.editFieldTitle')}
            visible={showEditFieldModal}
            onOk={() => {
                editField(editFieldInfo.id, newName)
            }}
            onCancel={() => {
                setShowEditFieldModal(false)
            }}
        >
            <Input
                value={newName}
                onChange={(e) => {
                    setNewName(e)
                }}
            />
        </Modal>
    </>


}

function FieldItem({f, currentTable, currentView, fields, setFields, filterFields, setFilterFields, setSelectedFields, selectedFields, setShowEditFieldModal, setEditFiledInfo}) {

    const {t} = useTranslation();

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

    async function deleteField(id) {
        Modal.confirm({
            width: 300,
            title: t('modal.deleteFieldTitle'),
            content: <div>
                <Space wrap>{
                    <Tag style={{maxWidth: "120px"}}>{f.name}</Tag>
                }</Space>
            </div>,
            async onOk() {

                try {
                    if (await currentTable.deleteField(id)) {
                        let newFields = fields.filter(f => {
                            return f.id !== id
                        })
                        let newFilterFields = filterFields.filter(f => {
                            return f.id !== id
                        })
                        setFields(newFields)
                        setFilterFields(newFilterFields)
                        if (selectedFields.indexOf(id) > -1) {
                            let newSelectedFields = selectedFields.filter(f => {
                                return f !== id
                            })
                            setSelectedFields(newSelectedFields)
                        }
                    } else {
                        Toast.error(t('toast.deleteFieldError'))
                    }
                } catch (e) {
                    Toast.error(t('toast.deleteFieldError'))
                }

            },
        })

    }


    return <>
        <Row style={{
            background: "#f5f5f5",
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            margin: "3px 0",
            borderRadius: "4px",
            maxWidth: "400px",
        }}>
            <Col span={15}>
                <Checkbox style={{flex: 1,}} key={f.id} value={f.id}>
                                <span style={{
                                    color: f.visable ? "black" : "gray"
                                }}>{f.name}</span>
                </Checkbox>
            </Col>
            <Col span={9} style={{
                textAlign: "right"
            }}>
                <Space>
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
                    <Button
                        icon={<IconEdit/>}
                        onClick={() => {
                            console.log("编辑字段名称", f)
                            setEditFiledInfo({
                                id: f.id,
                                name: f.name
                            })
                            setShowEditFieldModal(true)
                        }}
                    >
                    </Button>
                    <Button
                        icon={<IconDelete/>}
                        onClick={() => {
                            deleteField(f.id)
                        }} type={'danger'}/>

                </Space>

            </Col>
        </Row>

    </>
}

function ModifyView({currentView, currentTable}) {
    const {t} = useTranslation();
    const [fields, setFields] = useState([])
    const [filterFields, setFilterFields] = useState([])
    const [selectedFields, setSelectedFields] = useState([])
    const [fieldTypes, setFieldTypes] = useState([])
    const [viewName, setViewName] = useState("")

    // 编辑字段名称
    const [showEditFieldModal, setShowEditFieldModal] = useState(false)
    const [editFieldInfo, setEditFiledInfo] = useState({})

    async function editField(fieldId, newName) {
        console.log("编辑字段名称", newName, fieldId)
        await currentTable.setField(fieldId, {
            name: newName
        })
        Toast.success(t('toast.editSuccess'))
        setShowEditFieldModal(false)
        getFields()
    }

    useEffect(() => {
        getFields()
    }, [currentView])


    async function getFields() {
        console.log("getFields")
        let fields = await currentView.getFieldMetaList()
        let visible = await currentView.getVisibleFieldIdList()
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
        let viewName = await currentView.getName()
        setViewName(viewName)
        if (selectedFields.length > 0) {
            let newSelectedFields = selectedFields.filter(id => {
                return fields.some(f => f.id === id)
            })
            setSelectedFields(newSelectedFields)
        }
    }

    async function batchShowFields() {
        let ids = selectedFields
        if (ids.length === 0) {
            return
        }
        let fieldNames = ids.map(id => {
            return fields.find(f => f.id === id).name
        })

        Modal.info({
            width: 300,
            title: t('modal.batchShowFieldTitle'),
            content: <div>
                <Space wrap>{
                    fieldNames.map(name => {
                        return <Tag style={{maxWidth: "120px"}}>{name}</Tag>
                    })
                }</Space>
            </div>,
            async onOk() {
                for (let id of ids) {
                    await currentView.showField(id)
                }
                getFields()
            },
        })

    }

    async function batchHideFields() {
        let ids = selectedFields
        if (ids.length === 0) {
            return
        }

        let fieldNames = ids.map(id => {
            return fields.find(f => f.id === id).name
        })
        Modal.info({
            width: 300,
            title: t('modal.batchHideFieldTitle'),
            content: <div>
                <Space wrap>{
                    fieldNames.map(name => {
                        return <Tag style={{maxWidth: "120px"}}>{name}</Tag>
                    })
                }</Space>
            </div>,
            async onOk() {
                for (let id of ids) {
                    await currentView.hideField(id)
                }
                getFields()
            },
        })

    }

    async function batchDeleteFields() {
        let ids = selectedFields
        if (ids.length === 0) {
            return
        }
        let fieldNames = ids.map(id => {
            return fields.find(f => f.id === id).name
        })
        Modal.confirm({
            width: 300,
            title: t('modal.batchDeleteFieldTitle'),
            content: <div>
                <Space wrap>{
                    fieldNames.map(name => {
                        return <Tag style={{maxWidth: "120px"}}>{name}</Tag>
                    })
                }</Space>
            </div>,
            async onOk() {
                for (let id of ids) {
                    try {
                        await currentTable.deleteField(id)
                    }catch (e) {
                        let name = fields.find(f => f.id === id).name
                        Toast.error(t('toast.deleteFieldError')  + ":" + name)
                    }
                }
                getFields()
            },
        })
    }



    return <>
        <EditField showEditFieldModal={showEditFieldModal} setShowEditFieldModal={setShowEditFieldModal}
                   editFieldInfo={editFieldInfo} editField={editField}/>
        <div style={{fontWeight:500,textAlign:"center",background:"#eee",padding:"10px",maxWidth:"400px"}}>{t('currentView')}: {viewName}</div>

        <Card title={t('beautyView')} bodyStyle={{
            padding: "10px 12px",
            position: "relative"
        }}>
            <BeautyView currentView={currentView} currentTable={currentTable}/>
        </Card>

        <Card title={t('filedManager')} bodyStyle={{
            padding: "10px 12px",
            position: "relative"
        }}>
            <Button style={{
                position: "absolute",
                right: "10px",
                top: "10px"
            }} onClick={() => {
                getFields()
            }} icon={<IconRefresh/>}></Button>
            <Select
                multiple
                prefix={<IconFilter/>}
                onChange={(types: string[]) => {
                    console.log(types)
                    if (!types || types.length === 0) {
                        setFilterFields(fields)
                        return
                    }
                    let newFields = fields.filter(f => {
                        return types.indexOf(f.type) > -1
                    })
                    setFilterFields(newFields)
                }} style={{maxWidth: "400px", marginBottom: "3px"}} optionList={fieldTypes}
            ></Select>

            <Input
                style={{
                    maxWidth: "400px",
                }}
                prefix={<IconSearch/>}
                onChange={(value) => {
                    if (!value) {
                        setFilterFields(fields)
                        return
                    }
                    let newFields = fields.filter(f => {
                        return f.name.indexOf(value) > -1
                    })
                    setFilterFields(newFields)
                }}></Input>


            <CheckboxGroup value={selectedFields}
                           style={{
                               rowGap: "0px",
                           }}
                           onChange={(v) => {
                               setSelectedFields(v)
                           }}>

                <Divider margin={10}/>

                {
                    filterFields.map(f => {
                        return (<FieldItem key={f.id}
                                           f={f}
                                           currentTable={currentTable}
                                           currentView={currentView}
                                           fields={fields}
                                           setFields={setFields}
                                           filterFields={filterFields}
                                           setFilterFields={setFilterFields}
                                           setSelectedFields={setSelectedFields}
                                           selectedFields={selectedFields}
                                           setShowEditFieldModal={setShowEditFieldModal}
                                           setEditFiledInfo={setEditFiledInfo}
                        />)
                    })
                }
            </CheckboxGroup>
            <div
                style={{
                    display: "flex",
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
                <div>
                    <ButtonGroup>
                        <Button
                            icon={<IconEyeOpened/>}
                            onClick={() => {
                                batchShowFields()
                            }}>{t('button.show')}</Button>
                        <Button
                            icon={<IconEyeClosed/>}
                            onClick={() => {
                                batchHideFields()
                            }}>{t('button.hide')}</Button>

                        <Button
                            icon={<IconDelete/>}
                            type={'danger'}
                            onClick={() => {
                                batchDeleteFields()
                            }}>{t('button.delete')}</Button>
                    </ButtonGroup>
                </div>
            </div>
        </Card>
    </>

}


export default function App() {
    const {t} = useTranslation();
    const [loading, setLoading] = useState<boolean>(true);
    const [currentView, setCurrentView] = useState<IView | null>(null);
    const [currentViewType, setCurrentViewType] = useState<ViewType | null>(null);
    const [currentTable, setCurrentTable] = useState<ITable | null>(null);
    const {Text} = Typography;


    useEffect(() => {
        async function getSelection() {
            setLoading(true)
            let startTimeStep1 = performance.now();
            let selection = await bitable.base.getSelection()
            let endTimeStep1 = performance.now();
            let {tableId, viewId} = selection

            let startTimeStep2 = performance.now();
            let table = await bitable.base.getTableById(tableId!)
            let endTimeStep2 = performance.now();

            let startTimeStep3 = performance.now();
            let view = await table.getViewById(viewId!)
            let endTimeStep3 = performance.now();
            setCurrentView(view)
            setCurrentTable(table)

            let startTimeStep4 = performance.now();
            let viewType = await view.getType()
            let endTimeStep4 = performance.now();
            setCurrentViewType(viewType)


            console.log("耗时统计")
            console.log("getSelection", endTimeStep1 - startTimeStep1)
            console.log("getTableById", endTimeStep2 - startTimeStep2)
            console.log("getViewById", endTimeStep3 - startTimeStep3)
            console.log("getViewType", endTimeStep4 - startTimeStep4)
            console.log("总耗时", endTimeStep4 - startTimeStep1)
            setLoading(false)
        }

        getSelection();
        bitable.base.onSelectionChange((event) => {
            let data = event.data
            if (data.tableId && data.viewId) {
                getSelection()
            }
        });
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
        return <ModifyView currentView={currentView} currentTable={currentTable}/>
    } else {
        return (
            <main className="container">
                <Text type="secondary">{t("tip.ViewTypeMustBeGrid")}</Text>
            </main>
        );
    }
}

