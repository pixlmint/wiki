<template>
    <el-dialog title="Create Admin" v-model="isShowing">
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
    </el-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from "pixlcms-wrapper";
import {useDialogStore} from "@/src/stores/dialog";

const route = '/auth/create-admin';

export default defineComponent({
    data() {
        return {
            adminForm: {
                username: '',
                password: '',
            },
            dialogStore: useDialogStore(),
        }
    },
    computed: {
        isShowing: {
            get() {
                return route === this.dialogStore.getShowingDialog;
            },
            set() {
                this.dialogStore.clearShowingDialog();
            }
        },
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