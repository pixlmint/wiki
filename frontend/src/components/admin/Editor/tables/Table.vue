<template>
    <el-table v-if="data.table !== null" :data="data.table.data">
        <el-table-column width="70">
            <template #default="scope">
                <el-dropdown>
                    <el-button round>
                        <pm-icon icon="caret-down" />
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="addRowBefore(scope.$index)"
                            >add row above</el-dropdown-item
                        >
                        <el-dropdown-item @click="addRowAfter(scope.$index)"
                            >add row after</el-dropdown-item
                        >
                        <el-dropdown-item @click="deleteRow(scope.$index)"
                            >delete row</el-dropdown-item
                        >
                    </template>
                </el-dropdown>
            </template>
        </el-table-column>
        <el-table-column
            v-for="(col, index) in data.table.thead"
            :key="index"
            :prop="col"
            :label="col"
        >
            <template #header>
                <el-input v-model="data.table.thead[index]" />
                <el-dropdown>
                    <el-button round>
                        <pm-icon icon="caret-down" />
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="deleteColumn(index)"
                            >delete column</el-dropdown-item
                        >
                    </template>
                </el-dropdown>
            </template>
            <template #default="scope">
                <!-- {{ scope.row[scope.column.no] }} -->
                <el-input
                    type="textarea"
                    v-model="scope.row[scope.column.no - 1]"
                />
            </template>
        </el-table-column>
    </el-table>

    <!-- <el-button-group -->
    <!--     v-show="contextMenuOptions.visible" -->
    <!--     :style=" -->
    <!--         'top: ' + -->
    <!--         contextMenuOptions.y + -->
    <!--         'px; left: ' + -->
    <!--         contextMenuOptions.x + -->
    <!--         'px' -->
    <!--     " -->
    <!--     class="row-context-menu" -->
    <!-- > -->
    <!--     <el-button @click="addRowBefore">Add Row Above</el-button> -->
    <!--     <el-button @click="addRowAfter">Add Row Below</el-button> -->
    <!--     <el-button @click="deleteRow">Delete Row</el-button> -->
    <!--     <el-button @click="deleteColumn">Delete Column</el-button> -->
    <!-- </el-button-group> -->

    <div v-show="data.mdShowing">
        <pre>{{ data.mdContent }}</pre>
    </div>

    <el-button v-if="!data.mdShowing" @click="printMd">Show Markdown</el-button>
    <el-button v-else @click="data.mdShowing = false">Close</el-button>
    <el-button name="save" @click="save">Save</el-button>
</template>

<script lang="ts" setup>
import { TableData } from "@/contracts/Table";
import {
    htmlTableToTableData,
    tableDataToMarkdown,
} from "@/helpers/htmlTableData";
import { onMounted, reactive } from "vue";

// interface ReactiveTable {
//     table: HTMLTableElement | null;
//     tbody: HTMLTableSectionElement | null;
//     rowCount: number;
//     colCount: number;
//     tableData: Array<Table>;
//     tableHead: Array<string>;
//     hasHeading: boolean;
//     tableHash: number;
// }

// interface ContextMenu {
//     visible: boolean;
//     x: number;
//     y: number;
//     currentRowIndex: number;
//     currentCellIndex: number;
//     mode: "header" | "cell";
// }

const data = reactive<{
    table: TableData | null;
    mdShowing: boolean;
    mdContent: string;
}>({
    table: null,
    mdShowing: false,
    mdContent: "",
});

// const mdShowing = ref(false);
// const mdContent = ref("");

const emit = defineEmits<{ save: { md: string; hash: number }[] }>();

const props = defineProps<{
    table: string;
    hash: number;
}>();

// const data = reactive<ReactiveTable>({
//     table: null,
//     tbody: null,
//     rowCount: 0,
//     colCount: 0,
//     tableData: [],
//     tableHead: [],
//     hasHeading: false,
//     tableHash: 0,
// });

// const contextMenuOptions = ref<ContextMenu>({
//     visible: false,
//     x: 0,
//     y: 0,
//     currentRowIndex: -1,
//     currentCellIndex: -1,
//     mode: "cell",
// });

onMounted(() => {
    data.table = htmlTableToTableData(props.table);
});

// function documentClickHandler() {
//     contextMenuOptions.value.visible = false;
// }

function printMd() {
    if (data.table !== null) {
        data.mdContent = tableDataToMarkdown(data.table);
        data.mdShowing = true;
    }
}

function save() {
    if (data.table !== null) {
        console.log("saving");
        emit("save", {
            md: tableDataToMarkdown(data.table),
            hash: props.hash,
        });
    }
}

// function headerContextMenu(column: any, event: MouseEvent) {
//     event.preventDefault();
//     console.log(column);
// }

// function contextMenu(
//     row: any,
//     column: any,
//     cell: HTMLTableCellElement,
//     event: MouseEvent,
// ) {
//     event.preventDefault();
//     console.log(row, column);
//     contextMenuOptions.value.x = event.pageX;
//     contextMenuOptions.value.y = event.pageY;
//     contextMenuOptions.value.visible = true;
//     contextMenuOptions.value.currentRowIndex = rowIndexOf(row);
//     contextMenuOptions.value.currentCellIndex = column.no;
// }

// function rowIndexOf(rowData: any) {
//     const dataJson = JSON.stringify(rowData);
//     for (let i = 0; i < data.tableData.length; i++) {
//         const row = data.tableData[i];
//         if (row === rowData) {
//             return i;
//         } else if (JSON.stringify(row) === dataJson) {
//             return i;
//         }
//     }
//
//     return -1;
// }

function generateEmptyRow() {
    return data.table!.thead.map((head) => "");
}

function insertRowIntoTable(index: number) {
    if (data.table === null) {
        return;
    }
    if (data.table.data.length < index) {
        throw new Error(
            "Invalid index " +
                index +
                " for table of length " +
                data.table.data.length,
        );
    }
    data.table.data = [
        ...data.table.data.slice(0, index),
        generateEmptyRow(),
        ...data.table.data.slice(index),
    ];
}

function addRowBefore(rowIndex: number) {
    insertRowIntoTable(rowIndex);
}

function addRowAfter(rowIndex: number) {
    insertRowIntoTable(rowIndex + 1);
}

function deleteRow(rowIndex: number) {
    if (data.table === null) return;
    if (data.table.data.length - 1 < rowIndex) {
        throw new Error(
            "Invalid index " +
                rowIndex +
                " for table of length " +
                data.table.data.length,
        );
    }

    data.table.data = [
        ...data.table.data.slice(0, rowIndex),
        ...data.table.data.slice(rowIndex + 1),
    ];
}

function deleteColumn(colIndex: number) {
    console.log("delete column " + colIndex);
}
</script>

<style lang="scss" scoped>
.row-context-menu {
    display: block;
    min-height: 100px;
    min-width: 100px;
    background-color: var(--el-bg-secondary);
    position: absolute;
    z-index: 200;

    button {
        width: 100%;
    }
}
</style>
