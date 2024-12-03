<template>
    <div class="table-selector">
        <div class="mini-table" v-for="table, hash in data.littleTables" :key="hash">
            <div class="table-overlay" @click="selectTable(hash)" :data-table-hash="hash"></div>
            <div class="table-wrapper">
                <el-table :data="table.data">
                    <el-table-column v-for="heading, hIndex in table.thead" :key="hIndex" :prop="heading" :label="heading" /> 
                </el-table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { readTable } from '@/src/helpers/htmlTableData';

const props = defineProps(["tables"])
const emit = defineEmits(["select"]);

const MAX_ROWS = 3;
const MAX_CELLS = 3;

const data = reactive({
    littleTables: {},
});

function selectTable(hash: any) {
    emit('select', hash);
}

onMounted(() => {
    for (const table of props.tables) {
        const tableData = readTable(table.parsed);
        if (tableData.length() > MAX_ROWS) {
            tableData.spliceRows(MAX_ROWS);
        }
        if (tableData.width() > MAX_CELLS) {
            tableData.spliceColumns(MAX_CELLS)
        }
        data.littleTables[table.hash] = tableData;
    }
});
</script>

<style lang="scss" scoped>
.table-selector {
    display: flex;
    flex-wrap: wrap;

    .mini-table {
        width: 100%;
        position: relative;

        .table-overlay {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            z-index: 2;
        }

        .table-wrapper {
            z-index: 1;
        }
    }
}


@media screen and (min-width: 500px) {
    .table-selector {
        .mini-table {
            width: 30%;
        }
    }
}
</style>
