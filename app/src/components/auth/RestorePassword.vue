<template>
    <pm-dialog>
        <el-form @submit.prevent="submit">
            <div class="form-row">
                <input placeholder="Username" v-model="username" type="text"/>
            </div>
            <div class="form-row">
                <input placeholder="New Password" v-model="password1" type="password"/>
            </div>
            <div class="form-row">
                <input
                    placeholder="Repeat New Password"
                    v-model="password2"
                    type="password"
                />
            </div>
            <button class="mt-1" type="submit">Submit</button>
        </el-form>
    </pm-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "pixlcms-wrapper";

export const route = "/auth/restore-password";

export default defineComponent({
    data: () => {
        return {
            username: "",
            password1: "",
            password2: "",
        };
    },
    created() {
        useMainStore().setTitle('Restore Password - Wiki')
    },
    methods: {
        submit() {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            useAuthStore().restorePassword({
                username: this.username,
                password1: this.password1,
                password2: this.password2,
                token: urlParams.get('token') as string
            }).then(() => {
                // useRouter().push('/');
            });
        },
    },
})
</script>