<template>
    <pm-dialog :route="route" title="Login">
        <el-form :model="loginForm">
            <el-form-item label="Username">
                <el-input v-model="loginForm.username" />
            </el-form-item>
            <el-form-item label="Password">
                <el-input @change="submitLoginForm" type="password" v-model="loginForm.password"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="submitLoginForm">Login</el-button>
            </span>
        </template>
    </pm-dialog>
</template>

<script lang="ts" setup>
import { defineComponent, reactive } from "vue";
import { authStoreOptions, cmsStoreConfig, useBackendStore, useDialogStore } from "pixlcms-wrapper";
import { navFactory } from "@/src/helpers/nav";

const dialogStore = useDialogStore();

const dialogData = dialogStore.getDialogData(route);
const domain = (typeof dialogData === 'object' && 'domain' in dialogData) ? dialogData.domain : null;

const form = reactive({
    username: '',
    password: '',
});

const submitLoginForm = function() {
    const backendStore = useBackendStore();
    const authStore = backendStore.getStoreForBackend(domain, 'authStore', authStoreOptions);
    const cmsStore = backendStore.getStoreForBackend(domain, 'cmsStore', cmsStoreConfig);

    authStore.login(form).then(() => {
        dialogStore.hideDialog(route);
        cmsStore.loadNav(false, navFactory);
    });
}
</script>

<script lang="ts">
export const route = '/auth/login';

export default defineComponent({
    name: "LoginModal",
});
</script>
