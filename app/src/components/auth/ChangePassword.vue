<template>
    <pm-dialog title="Change Password">
        <el-form v-model="form" @submit.prevent="submit">
            <el-form-item label="Username">
                <el-input v-model="form.username"/>
            </el-form-item>
            <el-form-item label="Current Password">
                <el-input type="password" v-model="form.currentPassword"/>
            </el-form-item>
            <el-form-item label="New Password">
                <el-input v-model="form.newPassword1" type="password"/>
            </el-form-item>
            <el-form-item label="Repeat Password">
                <el-input v-model="form.newPassword2" type="password"/>
            </el-form-item>
            <el-button type="submit">Submit</el-button>
        </el-form>
    </pm-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore, useDialogStore} from "pixlcms-wrapper";

export const route = "/auth/change-password";

export default defineComponent({
    data: () => {
        return {
            form: {
                username: "",
                currentPassword: "",
                newPassword1: "",
                newPassword2: "",
            },
            dialogStore: useDialogStore(),
        };
    },
    methods: {
        submit() {
            useAuthStore().changePassword(this.form).then(() => {
                this.dialogStore.hideDialog(route);
            });
        },
    },
})
</script>
