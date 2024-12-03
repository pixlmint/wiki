<template>
    <el-table :data="table.data" v-if="table !== null">
        <el-table-column v-for="(col, index) in table.thead" :key="index" :prop="col" :label="col" sortable></el-table-column>
    </el-table>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// @ts-ignore
import { readTable, Table } from '@/src/helpers/htmlTableData';
const props = defineProps(["table"]);

const table = ref<Table|null>(null);

onMounted(() => {
    table.value = readTable(props.table);
});
</script>
