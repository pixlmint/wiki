<template>
    <pm-dialog :route="route" title="Login">
        <el-form :model="loginForm">
            <el-form-item label="Username">
                <el-input v-model="form.username" />
            </el-form-item>
            <el-form-item label="Password">
                <el-input @change="submitLoginForm" type="password" v-model="form.password"></el-input>
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
import { serviceManager, useDialogStore } from "pixlcms-wrapper";
import { navFactory } from "@/src/helpers/nav";

const dialogStore = useDialogStore();

const dialogData = dialogStore.getDialogData(route);
const domain = (dialogData !== null && typeof dialogData === 'object' && 'domain' in dialogData) ? dialogData.domain : undefined;

const form = reactive({
    username: '',
    password: '',
});

const submitLoginForm = function() {
    const cmsService = serviceManager.getInstance(domain);

    cmsService.auth.login(form).then(() => {
        dialogStore.hideDialog(route);
        cmsService.cms.loadNav(false, navFactory);
    });
}
</script>

<script lang="ts">
export const route = '/auth/login';

export default defineComponent({
    name: "LoginModal",
});
</script>
