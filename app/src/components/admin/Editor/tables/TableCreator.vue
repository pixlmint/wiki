<template>
    <el-form v-model="tableSpec" label-width="auto">
        <el-form-item label="Rows">
            <el-input type="number" v-model="tableSpec.rows"></el-input>
        </el-form-item>
        <el-form-item label="Columns">
            <el-input type="number" v-model="tableSpec.columns"></el-input>
        </el-form-item>
        <el-button type="primary" @click="create">Create</el-button>
    </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits(["create"]);

const tableSpec = ref({
    columns: 4,
    rows: 4,
});

function create() {
    emit('create', tableSpec.value);
}
</script>

