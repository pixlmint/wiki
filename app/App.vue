<template>
    <div class="wiki">
        <pw-loading></pw-loading>
        <pw-nav></pw-nav>
        <div class="main-content">
            <router-view></router-view>
        </div>
        <Modals/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import {useWikiStore} from "@/src/stores/wiki";
import {AxiosResponse} from "axios";
import {ElNotification} from "element-plus";
import Modals from "@/src/components/modals.vue";
import {useDialogStore} from "@/src/stores/dialog";

export default defineComponent({
    name: "App",
    components: {
        Modals,
    },
    data: () => {
        return {
            mainStore: useMainStore(),
            wikiStore: useWikiStore(),
            dialogStore: useDialogStore(),
        }
    },
    created() {
        const mainStore = useMainStore();
        const authStore = useAuthStore();
        authStore.loadToken();
        const entry = document.location.pathname;
        const token = authStore.getToken;
        mainStore.init(token).then((response: AxiosResponse) => {
            if (response.data.is_token_valid === 'token_invalid') {
                this.dialogStore.showDialog('/auth/login');
                ElNotification({
                    title: 'Error',
                    message: 'Your token is invalid, please login again',
                    type: 'warning',
                });
            }
            this.mainStore.setTitle(this.mainStore.getMeta.title);
            if (!this.mainStore.meta.adminCreated) {
                this.dialogStore.showDialog('/auth/create-admin');
            }
        })
        this.wikiStore.fetchEntry(entry).then(function () {
            const currentEntry = useWikiStore().currentEntry;
            if (currentEntry === null) {
                throw 'currentEntry is null';
            }
            useMainStore().setTitle(currentEntry.meta.title);
        });
    },
})
</script>

<style lang="scss">
@import './style/main.scss';
</style>