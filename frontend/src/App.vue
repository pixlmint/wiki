<template>
    <div class="wiki">
        <pw-loading></pw-loading>
        <pw-search v-show="searchShowing"></pw-search>
        <pw-nav></pw-nav>
        <WikiEntry
            v-if="mainContentLoaded && !isEditing"
            :key="currentPath"
        ></WikiEntry>
        <Editor v-else-if="mainContentLoaded && isEditing"></Editor>
        <Debug v-if="isDebugEnabled" />
        <Modals :dialog-components="dialogs" />
    </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { useMainStore } from "@/stores/main";
import {
    configureStores,
    useAuthStore,
    Modals,
    useDialogStore,
    useLoadingStore,
} from "pixlcms-wrapper";
import { useWikiStore } from "@/stores/wiki";
import { useUserSettings } from "@/stores/user-settings";
import { AxiosResponse } from "axios";
import { ElNotification } from "element-plus";
import { dialogs as createDialogs } from "@/dialogs";
const Debug = defineAsyncComponent(
    () => import("@/components/debug/debug.vue"),
);
import WikiEntry from "@/components/home/WikiEntry.vue";
import { isMobile } from "@/helpers/mobile-detector";
import { navigate } from "@/helpers/navigator";

const Editor = defineAsyncComponent(
    () => import("@/components/admin/Editor/Editor.vue"),
);

const mainStore = useMainStore();
const wikiStore = useWikiStore();
const dialogStore = useDialogStore();
const mainContentLoaded = ref(false);
const dialogs = ref(createDialogs());
const isEditing = ref(false);

const searchShowing = computed(() => mainStore.isSearchShowing);
const isDebugEnabled = computed(() => mainStore.meta.debugEnabled);
const currentPath = computed(
    () =>
        wikiStore.safeCurrentEntry.id +
        wikiStore.safeCurrentEntry.meta.dateUpdated,
);
const authStore = useAuthStore();
authStore.loadToken();
configureStores(authStore, useLoadingStore());
const settings = useUserSettings().loadUserSettings();
useUserSettings().setCurrentTheme();

const keyListener = (event: Event) => {
    if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        useMainStore().isSearchShowing = true;
        setTimeout(() => {
            document.getElementById("search-input").focus();
        }, 200);
    }
    if (event.key === "Escape") {
        useMainStore().isSearchShowing = false;
    }
};

const popStateHandler = (event: PopStateEvent) => {
    navigate(event.state.url);
    loadMainContent();
};

const loadMainContent = () => {
    const path = location.pathname;

    const regex = /\/?admin\/.*/gm;
    const match = regex.exec(path);

    if (match !== null && match.length > 0) {
        mainContentLoaded.value = true;
        isEditing.value = true;
        return;
    } else {
        isEditing.value = false;
    }

    useWikiStore()
        .fetchEntry(path)
        .then(() => {
            mainContentLoaded.value = true;
            if (isMobile()) {
                useMainStore().toggleLargeNavShowing(false);
            }
            useMainStore().setTitle(useWikiStore().safeCurrentEntry.meta.title);
        });
};

const init = () => {
    const authStore = useAuthStore();
    const mainStore = useMainStore();
    const token = authStore.getToken;
    mainStore.init(token).then((response: AxiosResponse) => {
        if (response.data.is_token_valid === "token_invalid") {
            dialogStore.showDialog("/auth/login");
            ElNotification({
                title: "Error",
                message: "Your token is invalid, please login again",
                type: "warning",
            });
        }
        mainStore.setTitle(mainStore.getMeta.title);
        if (!mainStore.meta.adminCreated) {
            dialogStore.showDialog("/auth/create-admin");
        }
    });
};

init();
loadMainContent();
window.addEventListener("keydown", keyListener);
window.addEventListener("popstate", popStateHandler);
window.addEventListener("pushstate", loadMainContent);
</script>

<style lang="scss">
@use "./style/main.scss";
@use "./style/variables" as *;

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
