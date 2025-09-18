<template>
    <div class="wiki">
        <pw-loading></pw-loading>
        <pw-search v-show="searchShowing"></pw-search>
        <pw-nav></pw-nav>
        <WikiEntry v-if="mainContentLoaded && !isEditing" :key="currentPath"></WikiEntry>
        <Editor v-else-if="isEditing"></Editor>
        <div v-else>Unable to determine state</div>
        <Debug v-if="isDebugEnabled" />
        <Modals :dialog-components="dialogs" />
    </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref } from "vue";
import { useMainStore } from "@/src/stores/main";
import { configureStores, useAuthStore, Modals, useDialogStore, useLoadingStore, useCmsStore, useBackendStore, cmsStoreConfig } from "pixlcms-wrapper";
import { useWikiStore } from "@/src/stores/wiki";
import { useUserSettings } from "@/src/stores/user-settings";
import { AxiosResponse } from "axios";
import { ElNotification } from "element-plus";
import Debug from "@/src/components/debug/debug.vue";
import WikiEntry from "@/src/components/home/WikiEntry.vue";
import { navigate } from "@/src/events";
import Editor from "@/src/components/admin/Editor/Editor.vue";
import { dialogs as createDialogs } from '@/src/dialogs';
import * as feService from "./src/services/feService";

const mainStore = useMainStore();
const wikiStore = useWikiStore();
const dialogStore = useDialogStore();
const authStore = useAuthStore();
const userSettings = useUserSettings();
const dialogs = createDialogs();

const isEditing = computed(() => {
    return wikiStore.isEditorActive;
});

const mainContentLoaded = computed(() => {
    return wikiStore.currentEntry !== null;
});

const searchShowing = computed(() => {
    return mainStore.isSearchShowing;
});

const isDebugEnabled = computed(() => {
    return mainStore.meta.debugEnabled;
});

const currentPath = computed(() => {
    return wikiStore.currentEntry!.id + wikiStore.currentEntry!.meta.dateUpdated;
});

const created = function () {
    authStore.loadToken();
    configureStores(useLoadingStore());
    userSettings.loadUserSettings();
    userSettings.setCurrentTheme();
    mainStore.init().then((response: AxiosResponse) => {
        if (response.data.is_token_valid === 'token_invalid') {
            dialogStore.showDialog('/auth/login');
            ElNotification({
                title: 'Error',
                message: 'Your token is invalid, please login again',
                type: 'warning',
            });
        }
        mainStore.setTitle(mainStore.getMeta.title);
        if (!mainStore.meta.adminCreated) {
            dialogStore.showDialog('/auth/create-admin');
        }
    })
    loadMainContent();

    window.addEventListener('keydown', keyListener);
    window.addEventListener('popstate', popStateHandler);
    window.addEventListener('pushstate', loadMainContent);
}

onUnmounted(() => {
    window.removeEventListener('keydown', keyListener);
    window.removeEventListener('popstate', popStateHandler);
    window.removeEventListener('pushstate', loadMainContent);
})

const keyListener = function (event: Event) {
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        useMainStore().isSearchShowing = true;
        setTimeout(() => {
            document.getElementById('search-input').focus();
        }, 200);
    }
    if (event.key === 'Escape') {
        mainStore.isSearchShowing = false;
    }
}
const popStateHandler = function (event: PopStateEvent) {
    console.log(event);
    navigate(event.state.url);
    loadMainContent();
}


const loadMainContent = function () {
    let path = location.pathname;

    // const regex = /\/?admin\/.*/gm;
    // const match = regex.exec(path);

    if (path === '/admin/edit') {
        wikiStore.isEditorActive = true;
        return;
    } else {
        wikiStore.isEditorActive = false;
    }

    feService.load(location.pathname + location.search).then(entry => {
        wikiStore.currentEntry = entry;
    });

    // let entryCmsStore = this.cmsStore;
    // wikiStore.fetchEntry(path).then(() => {
    //     mainContentLoaded.value = true;
    // });

    /*if (this.cmsStore.nav !== null) {
        const nav = this.cmsStore.nav! as Nav;
        const el = nav.findEntryById(path);
        if (el !== null) {
            const linkParent = isParentLink(el, nav);

            if (linkParent !== false) {
                this.cmsStore.fetchEntry(linkParent.id).then(() => {
                    const domain = this.cmsStore.safeCurrentEntry.meta.domain as string;
                    entryCmsStore = useBackendStore().getStoreForBackend(domain, 'cmsStore', cmsStoreConfig);
                    path = path.slice(this.cmsStore.safeCurrentEntry.id.length);
                });
            }
        }
    }*/
    /*entryCmsStore.fetchEntry(path).then(() => {
        const mainStore = useMainStore();
        this.mainContentLoaded = true;
        if (isMobile()) {
            mainStore.toggleLargeNavShowing(false);
        }
        mainStore.setTitle(entryCmsStore.safeCurrentEntry.meta.title);
    })*/
    // if (el !== null && isParentLink(el, nav)) {

    // } else {
    //     this.cmsStore.fetchEntry(path).then(success => {
    //         const mainStore = useMainStore();
    //         this.mainContentLoaded = true;
    //         if (isMobile()) {
    //             mainStore.toggleLargeNavShowing(false);
    //         }
    //         mainStore.setTitle(this.cmsStore.safeCurrentEntry.meta.title);
    //     })
    // }

    /*return useWikiStore().fetchEntry(path).then(success => {
        if (success) {
            this.mainContentLoaded = true;
            if (isMobile()) {
                useMainStore().toggleLargeNavShowing(false);
            }
            useMainStore().setTitle(useWikiStore().safeCurrentEntry.meta.title);
        }
    });*/

}

created()
</script>

<style lang="scss">
@import './style/main.scss';

.main-content {
    background-color: var(--el-bg-color);
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    min-height: 100vh;
    padding: 5px;
    box-sizing: border-box;

    &.small-nav {
        margin: 0 auto 0 $navSmallWidth;
        width: calc(100vw - $navSmallWidth);

        img {
            max-width: calc(100vw - $navSmallWidth - 4 * 5px);
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
    html.dark .main-content {
        border-left: 1px solid var(--el-border-color);
    }

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
    html.dark .main-content {
        border-right: 1px solid var(--el-border-color);
    }

    .main-content {
        min-width: unset !important;

        img {
            max-width: calc(900px - 4 * 5px) !important;
        }

        &.article-width {
            max-width: 900px !important;

            &.small-nav {
                margin: 0 auto 0 auto;
            }
        }
    }
}
</style>
