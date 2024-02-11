<template>
    <pm-dialog :route="route" title="Login">
        <el-form :model="loginForm">
            <el-form-item label="Username">
                <el-input v-model="loginForm.username"/>
            </el-form-item>
            <el-form-item label="Password">
                <el-input type="password" v-model="loginForm.password"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
              <span class="dialog-footer">
        <el-button @click="submitLoginForm">Login</el-button>
      </span>
        </template>
    </pm-dialog>
</template>

<script>
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore, useDialogStore} from "pixlcms-wrapper";
import {useWikiStore} from "@/src/stores/wiki";

export const route = '/auth/login';

export default defineComponent({
    name: "LoginModal",
    data() {
        return {
            loginForm: {
                username: '',
                password: '',
            },
            authStore: useAuthStore(),
            mainStore: useMainStore(),
            dialogStore: useDialogStore(),
            route: route,
        }
    },
    methods: {
        submitLoginForm() {
            this.authStore.login(this.loginForm).then(() => {
                this.dialogStore.hideDialog(this.route);
                useWikiStore().loadNav();
            });
        },
    },
})
</script>