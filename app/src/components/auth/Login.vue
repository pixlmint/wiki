<template>
    <el-dialog title="Login" v-model="isShowing">
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
    </el-dialog>
</template>

<script>
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "pixlcms-wrapper";
import {useDialogStore} from "@/src/stores/dialog";
import {useWikiStore} from "@/src/stores/wiki";

const route = '/auth/login';

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
        }
    },
    methods: {
        submitLoginForm() {
            this.authStore.login(this.loginForm).then(() => {
                this.dialogStore.clearShowingDialog();
                useWikiStore().loadNav();
            })
        },
    },
    computed: {
        isShowing: {
            get() {
                return route === this.dialogStore.getShowingDialog;
            },
            set() {
                this.dialogStore.clearShowingDialog();
            }
        }
    },
})
</script>