<template>
    <pm-dialog title="Create Admin" :route="route">
        <el-form v-model="adminForm">
            <el-form-item label="Username">
                <el-input type="text" v-model="adminForm.username"/>
            </el-form-item>
            <el-form-item label="Password">
                <el-input class="uk-input" type="text" v-model="adminForm.password"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="submit">Submit</el-button>
        </template>
    </pm-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore, useDialogStore} from "pixlcms-wrapper";

export const route = '/auth/create-admin';

export default defineComponent({
    data() {
        return {
            adminForm: {
                username: '',
                password: '',
            },
            dialogStore: useDialogStore(),
            route: route,
        }
    },
    methods: {
        submit() {
            useAuthStore()
                .createAdmin(this.adminForm)
                .then((response) => {
                    if (response.data.adminCreated) {
                        this.dialogStore.showDialog('/auth/login');
                    }
                })
        }
    }
})
</script>