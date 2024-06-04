<template>
    <div class="wiki">
        <pw-loading></pw-loading>
        <pw-search v-show="searchShowing"></pw-search>
        <pw-nav></pw-nav>
        <WikiEntry v-if="mainContentLoaded && !isEditing" :key="currentPath"></WikiEntry>
        <Editor v-else-if="mainContentLoaded && isEditing"></Editor>
        <Debug v-if="isDebugEnabled"/>
        <Modals :dialog-components="dialogs"/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {configureStores, useAuthStore, Modals, useDialogStore, useLoadingStore} from "pixlcms-wrapper";
import {useWikiStore} from "@/src/stores/wiki";
import {useUserSettings} from "@/src/stores/user-settings";
import {AxiosResponse} from "axios";
import {ElNotification} from "element-plus";
import {dialogs} from '@/src/dialogs';
import Debug from "@/src/components/debug/debug.vue";
import WikiEntry from "@/src/components/home/WikiEntry.vue";
import {isMobile} from "@/src/helpers/mobile-detector";
import {navigate} from "@/src/helpers/navigator";
import Editor from "@/src/components/admin/Editor/Editor.vue";

export default defineComponent({
    name: "App",
    components: {
        Editor,
        WikiEntry,
        Debug,
        Modals,
    },
    data: () => {
        return {
            mainStore: useMainStore(),
            wikiStore: useWikiStore(),
            dialogStore: useDialogStore(),
            mainContentLoaded: false,
            dialogs: dialogs(),
            isEditing: false,
        }
    },
    computed: {
        searchShowing() {
            return useMainStore().isSearchShowing;
        },
        isDebugEnabled() {
            return this.mainStore.meta.debugEnabled;
        },
        currentPath() {
            return this.wikiStore.safeCurrentEntry.id;
        },
    },
    created() {
        const authStore = useAuthStore();
        authStore.loadToken();
        configureStores(authStore, useLoadingStore());
        const settings = useUserSettings().loadUserSettings();
        useUserSettings().setCurrentTheme();
        this.init();
        this.loadMainContent();
        window.addEventListener('keydown', this.keyListener);
        window.addEventListener('popstate', this.popStateHandler);
        window.addEventListener('pushstate', this.loadMainContent);
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
        popStateHandler(event: PopStateEvent) {
            navigate(event.state.url);
            this.loadMainContent();
        },
        loadMainContent() {
            const path = location.pathname;

            const regex = /\/?admin\/.*/gm;
            const match = regex.exec(path);

            if (match !== null && match.length > 0) {
                this.mainContentLoaded = true;
                this.isEditing = true;
                return;
            } else {
                this.isEditing = false;
            }

            useWikiStore().fetchEntry(path).then(() => {
                this.mainContentLoaded = true;
                if (isMobile()) {
                    useMainStore().toggleLargeNavShowing(false);
                }
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
        &.large-nav.article-width {
            margin: 0 auto 0 auto;
        }
    }
}

@media screen and (min-width: 1300px) and (max-width: 1599px) {
    .main-content {
        &.large-nav {
            margin: 0 auto 0 $navLargeWidth;
        }
    }
}

@media screen and (min-width: 1300px) {
    .main-content {
        min-width: unset !important;
        box-shadow: var(--box-shadow);

        img {
            max-width: 1000px !important;
        }

        &.article-width {
            max-width: 1000px !important;

            &.small-nav {
                margin: 0 auto 0 auto;
            }
        }
    }
}
</style>
