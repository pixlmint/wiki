<template>
    <pm-dialog id="table-editor-modal" :route="route" title="Edit Table">
        <Table v-if="data.editingTable !== null" :table="data.editingTable.parsed" :hash="data.editingTable.hash" @save="handleSave" />
        <TableSelector v-else-if="!data.showTableCreator" :tables="data.availableTables" @select="handleSelect" />
        <TableCreator v-else @create="handleCreate" />
        <el-button @click="showTableSelector" v-show="showTriggerTableSelectorButton">Select Different Table</el-button>
        <el-button @click="createNewTable" v-show="showCreateTableButton">Create New Table</el-button>
    </pm-dialog>
</template>


<script lang="ts" setup>
import { computed, defineComponent, onMounted, reactive } from 'vue';
// @ts-ignore
import { useWikiStore } from "@/src/stores/wiki";
// @ts-ignore
import { marked } from "marked";
// @ts-ignore
import Table from "./Table";
// @ts-ignore
import TableSelector from "./TableSelector";
// @ts-ignore
import TableCreator from "./TableCreator";
import { useDialogStore } from 'pixlcms-wrapper';

interface MdTable {
    original: string,
    parsed: string,
    hash: number,
    updated?: string,
};

const wikiStore = useWikiStore();
const dialogStore = useDialogStore();

type DataType = {
    editingTable: null | MdTable,
    availableTables: Array<MdTable>,
    showTableCreator: boolean,
}

const data = reactive<DataType>({
    editingTable: null,
    availableTables: [],
    showTableCreator: false,
})

onMounted(() => {
    data.availableTables = extractTables();
    if (data.availableTables.length === 1) {
        data.editingTable = data.availableTables[0];
    } else if (data.availableTables.length === 0) {
        data.showTableCreator = true;
    }
});

const handleSelect = function (hash: number) {
    for (const table of data.availableTables) {
        if (table.hash == hash) {
            data.editingTable = table;
            break;
        }
    }
}

const showTableSelector = function () {
    data.editingTable = null;
}

const generateTableHash = function (table: string) {
    let hash = 0, i, chr;
    if (table.length === 0) return hash;
    for (i = 0; i < table.length; i++) {
        chr = table.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }

    return hash;
}

const extractTables = function (): Array<MdTable>  {
    const md = wikiStore.safeCurrentEntry.raw_content;
    const tableRegex = /(?:^\|[^\n]+\|\r?\n)+/gm;

    const matches = [...md.matchAll(tableRegex)];

    return matches.map(match => {
        return <MdTable> {
            original: match.toString(),
            parsed: marked.parse(match.toString()),
            hash: generateTableHash(match.toString()),
        };
    });
}

const handleSave = function (updated: string, hash: number) {
    let spotFound = false;
    if (hash === 0) {
        spotFound = true;
        wikiStore.safeCurrentEntry.raw_content += "\n" + updated;
    } else {
        for (const table of data.availableTables) {
            if (table.hash === hash) {
                const newContent = wikiStore.safeCurrentEntry.raw_content.replace(table.original, updated);
                wikiStore.safeCurrentEntry.raw_content = newContent;
                spotFound = true;
            }
        }
    }
    if (!spotFound) {
        console.error("Unable to replace/ insert the table");
    } else {
        dialogStore.hideDialog(route);
    }
}

const handleCreate = function (table: {columns: number, rows: number}) {
    const el = document.createElement('table');
    const thead = el.createTHead();
    const tbody = el.createTBody();
    const head = thead.insertRow();
    for (let i = 0; i < table.columns; i++) {
        const th = head.insertCell()
        th.innerText = "" + i;
        const row = tbody.insertRow();
        for (let j = 0; j < table.rows; j++) {
            const td = row.insertCell();
            td.innerText = '';
        }
    }

    const newTable: MdTable = {
        original: '',
        parsed: el.outerHTML,
        hash: 0,
    }

    data.editingTable = newTable;
}

const showCreateTableButton = computed(() => {
    return (data.editingTable === null && !data.showTableCreator) || (data.editingTable !== null && data.availableTables.length === 1);
});

const showTriggerTableSelectorButton = computed(() => {
    return data.editingTable !== null && data.availableTables.length > 1;
});

const createNewTable = function () {
    data.showTableCreator = true;
    data.editingTable = null;
}
</script>

<script lang="ts">
export default defineComponent({
    name: "TableEditorModal",
});
export const route = "/table-editor";
</script>


<style lang="scss">

</style>

