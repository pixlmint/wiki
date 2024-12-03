<template>
    <el-table :data="data.tableData" @cell-contextmenu="contextMenu" @header-contextmenu="headerContextMenu">
        <el-table-column v-for="(col, index) in data.tableHead" :key="index" :prop="col" :label="col" sortable>
            <template #default="scope">
                <el-input v-model="scope.row[col]" />
            </template>
        </el-table-column>
    </el-table>

    <el-button-group v-show="contextMenuOptions.visible" :style="'top: ' + contextMenuOptions.y + 'px; left: ' + contextMenuOptions.x + 'px'" class="row-context-menu">
        <el-button @click="addRowBefore">Add Row Above</el-button>
        <el-button @click="addRowAfter">Add Row Below</el-button>
        <el-button @click="deleteRow">Delete Row</el-button>
        <el-button @click="deleteColumn">Delete Column</el-button>
    </el-button-group>

    <div v-show="mdShowing">
        <textarea>{{mdContent}}</textarea>
    </div>

    <el-button v-if="!mdShowing" @click="printMd">Show Markdown</el-button>
    <el-button v-else @click="mdShowing = false">Close</el-button>
    <el-button @click="save">Save</el-button>
</template>

<script lang="ts" setup>
import { Table, readTable } from '@/src/helpers/htmlTableData';
import { reactive } from '@vue/reactivity';
import { useDialogStore } from 'pixlcms-wrapper';
import { onMounted, onUnmounted, ref } from 'vue';


interface ReactiveTable {
    table: HTMLTableElement | null,
    tbody: HTMLTableSectionElement | null,
    rowCount: number,
    colCount: number,
    tableData: Array<Object>,
    tableHead: Array<string>,
    hasHeading: boolean,
    tableHash: number,
}

interface ContextMenu {
    visible: boolean,
    x: number,
    y: number,
    currentRowIndex: number,
    currentCellIndex: number,
    mode: 'header' | 'cell',
}

const mdShowing = ref(false);
const mdContent = ref("");

const emit = defineEmits(["save"]);
const props = defineProps(["table", "hash"]);
const data = reactive<ReactiveTable>({
    table: null,
    tbody: null,
    rowCount: 0,
    colCount: 0,
    tableData: [],
    tableHead: [],
    hasHeading: false,
    tableHash: 0,
});

const contextMenuOptions = ref<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    currentRowIndex: -1,
    currentCellIndex: -1,
    mode: 'cell',
});


const dialogStore = useDialogStore();

onMounted(() => {
    _init();
    document.addEventListener('click', documentClickHandler);
});

onUnmounted(() => {
    document.removeEventListener('click', documentClickHandler);
});

function documentClickHandler() {
    contextMenuOptions.value.visible = false;
}

function _init() {
    const table: Table = readTable(props.table);
    data.tableData = table.data;
    data.tableHead = table.thead;
    data.colCount = table.width();
    data.rowCount = table.length();
    data.hasHeading = true;
    data.tableHash = props.hash;
}

function printMd() {
    mdContent.value = generateMarkdown();
    mdShowing.value = true;
}

function save() {
    console.log('saving');
    emit('save', generateMarkdown(), data.tableHash);
}

function headerContextMenu(column: any, event: MouseEvent) {
    event.preventDefault();
    console.log(column);
}

function contextMenu(row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent) {
    event.preventDefault();
    console.log(row, column);
    contextMenuOptions.value.visible = true;
    const dialogEl = document.getElementById('table-editor-modal');
    // @ts-ignore
    contextMenuOptions.value.x = event.pageX - dialogEl.offsetLeft;
    // @ts-ignore
    contextMenuOptions.value.y = event.y + dialogStore.getDialogScrollHeight - dialogEl.offsetTop;
    contextMenuOptions.value.currentRowIndex = rowIndexOf(row);
    contextMenuOptions.value.currentCellIndex = column.no;
}

function rowIndexOf(rowData: any) {
    const dataJson = JSON.stringify(rowData);
    for (let i = 0; i < data.tableData.length; i++) {
        const row = data.tableData[i];
        if (row === rowData) {
            return i;
        } else if (JSON.stringify(row) === dataJson) {
            return i;
        }
    }

    return -1;
}

function generateEmptyRow() {
    const newRow = {};
    for (const col of data.tableHead) {
        // @ts-ignore
        newRow[col] = "";
    }

    return newRow;
}

function insertRowIntoTable(index: number) {
    if (data.tableData.length < index) {
        throw new Error("Invalid index " + index + " for table of length " + data.tableData.length);
    }
    data.tableData = [
        ...data.tableData.slice(0, index),
        generateEmptyRow(),
        ...data.tableData.slice(index),
    ];
}

function addRowBefore() {
    console.log("new row before " + contextMenuOptions.value.currentRowIndex);
    insertRowIntoTable(contextMenuOptions.value.currentRowIndex);
}

function addRowAfter() {
    console.log("new row after " + contextMenuOptions.value.currentRowIndex);
    insertRowIntoTable(contextMenuOptions.value.currentRowIndex + 1);
}

function deleteRow() {
    const index = contextMenuOptions.value.currentRowIndex;
    console.log("delete row " + index);
    if (data.tableData.length - 1 < index) {
        throw new Error("Invalid index " + index + " for table of length " + data.tableData.length);
    }

    data.tableData = [
        ...data.tableData.slice(0, index),
        ...data.tableData.slice(index + 1),
    ];
}

function deleteColumn() {
    console.log("delete column " + contextMenuOptions.value.currentCellIndex);
}

function padString(string: string, targetLength: number, padCharacter = " ") {
    if (targetLength === undefined) {
        return string;
    }
    let padding = "";
    for (let i = string.length; i < targetLength; i++) {
        padding += padCharacter;
    }
    return string + padding;
}

function generateMarkdown() {
    let md = "";
    const biggestColumns = {};
    if (data.hasHeading) {
        for (const heading of data.tableHead) {
            // @ts-ignore
            biggestColumns[heading] = heading.length;
        }
        for (const row of data.tableData) {
            for (const cell of data.tableHead) {
                // @ts-ignore
                const cellSize = row[cell].length;
                // @ts-ignore
                if (biggestColumns[cell] < cellSize) {
                    // @ts-ignore
                    biggestColumns[cell] = cellSize;
                }
            }
        }
    }
    if (data.hasHeading) {
        md += "| ";
        let headingSep = "| ";

        let headingIndex = 0;
        for (const heading of data.tableHead) {
            if (headingIndex !== 0) {
                md += " | ";
                headingSep += " | ";
            }
            // @ts-ignore
            md += padString(heading, biggestColumns[heading]);
            // @ts-ignore
            headingSep += padString("", biggestColumns[heading], "-");
            headingIndex++;
        }

        md += " |\n";
        md += headingSep + " |\n";
    }
    for (const row of data.tableData) {
        let cellIndex = 0;
        md += "| ";
        for (const cell of data.tableHead) {
            if (cellIndex !== 0) {
                md += " | ";
            }
            // @ts-ignore
            md += padString(row[cell], biggestColumns[cell]);
            cellIndex++;
        }
        md += " |\n";
    }

    return md;
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
