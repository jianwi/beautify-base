// NotSupport = 0,
//     Text = 1,
//     Number = 2,
//     SingleSelect = 3,
//     MultiSelect = 4,
//     DateTime = 5,
//     Checkbox = 7,
//     User = 11,
//     Phone = 13,
//     Url = 15,
//     Attachment = 17,
//     SingleLink = 18,
//     Lookup = 19,
//     Formula = 20,
//     DuplexLink = 21,
//     Location = 22,
//     GroupChat = 23,
//     Denied = 403,
//     /**
//      * 引用类型字段，前后端约定用10xx公共前缀开头
//      */
//     CreatedTime = 1001,
//     ModifiedTime = 1002,
//     CreatedUser = 1003,
//     ModifiedUser = 1004,
//     AutoNumber = 1005,
//     Barcode = 99001,
//     Progress = 99002,
//     Currency = 99003,
//     Rating = 99004

const config = [
    ["filterByType", "类型筛选", "Filter by field type"],
    ["filterByName", "名称筛选", "Filter by field name"],
    ["tip.ViewTypeMustBeGrid", "请在表格视图下使用", "Please use in grid view"],
    ["button.beautifyByContent", "按照内容调整列宽", "Adjust column width by content"],
    ["button.beautifyByHeader", "按照表头调整列宽", "Adjust column width by header"],
    ["button.syncToAllViews", "同步列宽到所有视图", "Sync column width to all views"],
    ["tab.modify", "字段管理", "Field Management"],
    ["tab.beauty", "一键美化视图", "Beautify View"],
    ["text.currentView", "当前视图", "Current View"],
    ["field.type.0", "未知类型", "unknown"],
    ["field.type.1", "文本", "Text"],
    ["field.type.2", "数字", "Number"],
    ["field.type.3", "单选", "Single Select"],
    ["field.type.4", "多选", "Multi Select"],
    ["field.type.5", "日期", "Date"],
    ["field.type.7", "复选框", "Checkbox"],
    ["field.type.11", "用户", "User"],
    ["field.type.13", "电话", "Phone"],
    ["field.type.15", "网址", "Url"],
    ["field.type.17", "附件", "Attachment"],
    ["field.type.18", "单条关联", "Single Link"],
    ["field.type.19", "多条关联", "Multi Link"],
    ["field.type.20", "公式", "Formula"],
    ["field.type.21", "双向关联", "Duplex Link"],
    ["field.type.22", "位置", "Location"],
    ["field.type.23", "群聊", "Group Chat"],
    ["field.type.403", "禁止", "Denied"],
    ["field.type.1001", "创建时间", "Created Time"],
    ["field.type.1002", "修改时间", "Modified Time"],
    ["field.type.1003", "创建人", "Created User"],
    ["field.type.1004", "修改人", "Modified User"],
    ["field.type.1005", "自动编号", "Auto Number"],
    ["field.type.99001", "条形码", "Barcode"],
    ["field.type.99002", "进度", "Progress"],
    ["field.type.99003", "货币", "Currency"],
    ["field.type.99004", "评分", "Rating"],
    ["toast.deleteSuccess", "删除成功", "success"],
    ["toast.deleteFail", "删除失败", "fail"],
    ["modal.editFieldTitle", "编辑字段", "Edit Field"],
    ["toast.editSuccess", "编辑成功", "success"],
]


let rr = {
    zh: {},
    en: {}
}
config.forEach(item => {
    rr.zh[item[0]] = item[1]
    rr.en[item[0]] = item[2]
})

export default rr
