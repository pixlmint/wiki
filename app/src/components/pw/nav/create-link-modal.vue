<template>
    <pm-dialog :route="route" title="Create Link">
        <el-form>
            <el-form-item label="Title">
                <el-input v-model="linkTitle" />
            </el-form-item>
            <el-form-item label="Domain">
                <el-input v-model="linkDomain" />
            </el-form-item>
        </el-form>
        <el-button @click="save">Save</el-button>
    </pm-dialog>
</template>

<script lang="ts" setup>
import { useDialogStore } from 'pixlcms-wrapper';
import { ref } from 'vue';

const dialogStore = useDialogStore();

const linkTitle = ref('');
const linkDomain = ref('');

function save() {
    const data = dialogStore.getDialogData(route);
    data.title = linkTitle.value;
    data.domain = linkDomain.value;
    dialogStore.hideDialog(route);
}
</script>

<script lang="ts">
export const route = "/nav/create-link";
</script>
