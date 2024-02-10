<template>
    <div class="wiki">
        <pw-loading></pw-loading>
        <pw-search v-show="searchShowing"></pw-search>
        <pw-nav></pw-nav>
        <div :class="mainContentClasses">
            <router-view v-if="mainContentLoaded"></router-view>
        </div>
        <Modals/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import {useWikiStore} from "@/src/stores/wiki";
import {useUserSettings} from "@/src/stores/user-settings";
import {AxiosResponse} from "axios";
import {ElNotification} from "element-plus";
import Modals from "@/src/components/modals.vue";
import {useDialogStore} from "@/src/stores/dialog";
import {configureStores} from "@/src/helpers/xhr";
import {useLoadingStore} from "@/src/stores/loading";

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
            mainContentLoaded: false,
        }
    },
    computed: {
        mainContentClasses() {
            if (this.mainStore.isLargeNavShowing) {
                return 'main-content large-nav';
            } else {
                return 'main-content small-nav';
            }
        },
        searchShowing() {
            return useMainStore().isSearchShowing;
        },
    },
    created() {
        const authStore = useAuthStore();
        authStore.loadToken();
        configureStores(authStore, useLoadingStore());
        const settings = useUserSettings().loadUserSettings();
        useUserSettings().setCurrentTheme(settings.theme);
        this.init();
        this.loadMainContent();
        window.addEventListener('keydown', this.keyListener);
    },
    methods: {
        keyListener(event: Event) {
            if (event.ctrlKey && event.key === 'k') {
                event.preventDefault();
                useMainStore().isSearchShowing = true;
                setTimeout(() => {
                    document.getElementById('search-input').focus();
                }, 200);
            }
            if (event.key === 'Escape') {
                useMainStore().isSearchShowing = false;
            }
        },
        loadMainContent() {
            const path = location.pathname;

            const regex = /\/?admin\/.*/gm;
            const match = regex.exec(path);

            if (match !== null && match.length > 0) {
                this.mainContentLoaded = true;
                return;
            }

            useWikiStore().fetchEntry(path).then(() => {
                this.mainContentLoaded = true;
                useMainStore().setTitle(useWikiStore().safeCurrentEntry.meta.title);
            })
        },
        init() {
            const authStore = useAuthStore();
            const mainStore = useMainStore();
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
        },
    },
})
</script>

<style lang="scss">
@import './style/main.scss';

.main-content {
    background-color: var(--el-bg-color);
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    min-height: 100vh;
    padding: 5px;

    &.small-nav {
        margin: 0 auto 0 $navSmallWidth;
        width: calc(100vw - $navSmallWidth);

        img {
            max-width: calc(100vw - $navSmallWidth);
        }
    }

    &.large-nav {
        width: calc(100vw - $navLargeWidth);

        img {
            max-width: calc(100vw - $navLargeWidth);
        }
    }

    img {
        margin: 0 auto;
    }
}

@media screen and (min-width: $mobileBreakpoint) {
    .main-content {
        margin: 0 0 0 $navLargeWidth;

        .article {
            .article-body {
                padding: 0;
            }
        }
    }
}

@media screen and (min-width: 1600px) {
    .main-content {
        &.large-nav {
            margin: 0 auto 0 auto !important;
        }
    }
}

@media screen and (min-width: 1300px) {
    .main-content {
        min-width: unset !important;
        max-width: 1000px !important;
        box-shadow: var(--box-shadow);

        img {
            max-width: 1000px !important;
        }

        &.large-nav {
            margin: 0 auto 0 $navLargeWidth;
        }

        &.small-nav {
            margin: 0 auto 0 auto;
        }
    }
}
</style>
