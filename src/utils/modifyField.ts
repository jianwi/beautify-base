import {IGridView, ITable, IView, ViewType, bitable} from "@lark-base-open/js-sdk";


export async function getTableAndViewInfo() {
    // 1. 读取选中的表id 和 视图
    const selection = await bitable.base.getSelection();
    console.log("selection", selection)
    let {viewId, tableId} = selection

    return selection

}