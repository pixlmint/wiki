<template>
    <pm-dialog title="Request New Password">
        <el-form @submit.prevent="submit">
            <el-form-item label="Username">
                <el-input v-model="username" type="text"/>
            </el-form-item>
            <el-button @click="submit">Submit</el-button>
        </el-form>
    </pm-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from "pixlcms-wrapper";

export const route = "/auth/request-new-password";

export default defineComponent({
    data: () => {
        return {
            username: "",
        };
    },
    methods: {
        submit() {
            useAuthStore().requestNewPassword({username: this.username});
        },
    },
})
</script>