<template>
    <pm-dialog :route="route" title="Create Link">
        <el-form>
            <el-form-item label="Title">
                <el-input v-model="formData.title" />
            </el-form-item>
            <el-form-item label="Domain">
                <el-input v-model="formData.domain" />
            </el-form-item>
            <el-form-item label="Username">
                <el-input v-model="formData.username" />
            </el-form-item>
            <el-form-item label="Password">
                <el-input type="password" v-model="formData.password" />
            </el-form-item>
        </el-form>
        <el-button @click="test">Test</el-button>
        <el-button @click="save">Save</el-button>
    </pm-dialog>
</template>

<script lang="ts" setup>
import { useWikiStore } from '@/src/stores/wiki';
import { authStoreOptions, useBackendStore, useDialogStore } from 'pixlcms-wrapper';
import { reactive } from 'vue';

const dialogStore = useDialogStore();

const formData = reactive({
    title: '2025',
    domain: 'https://2025.christian-groeber.ch',
    username: 'christian',
    password: '',
});

function test() {
    useWikiStore().testLink(formData.domain);
}

function save() {
    const data = dialogStore.getDialogData(route);
    const backendStore = useBackendStore();
    backendStore.registerBackend(formData);
    const remoteAuthStore = backendStore.getStoreForBackend(formData.domain, 'authStore', authStoreOptions);

    remoteAuthStore.login(formData).then(() => {
        data.title = formData.title;
        data.domain = formData.domain;
        data.username = formData.username;
        dialogStore.hideDialog(route);
    });
}
</script>

<script lang="ts">
export const route = "/nav/create-link";
</script>
