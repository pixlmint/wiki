<template>
    <div>
        <div id="nav" class="print-invisible" v-show="mainNavShowing">
            <div>
                <div @click="hideMainNav" class="nav-toggle">
                    <pm-icon icon="caret-left"></pm-icon>
                </div>
                <el-menu @open="openSubmenu" @close="closeSubmenu" @click="navClickListener" :router="false" class="main-nav">
                    <el-menu-item class="pw-menu-item" data-pw-entry-id="/" data-is-entry="true" index="/">
                        <pw-nav-entry-title :element-id="0" :should-display-dropdown="false" element-title="Home">
                            <template #title>
                                <pm-icon icon="house"></pm-icon>
                            </template>
                        </pw-nav-entry-title>
                    </el-menu-item>
                    <template v-for="(childElement, myIndex) in nav.children" :key="myIndex">
                        <PWNavElement :element="childElement" v-if="childElement.isPublic || canEdit"></PWNavElement>
                    </template>
                </el-menu>
                <el-dropdown class="full-width" v-if="canEdit">
                    <el-button class="full-width">
                        <pm-icon icon="circle-plus"></pm-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="addSubEntry"><pm-icon icon="file-circle-plus"></pm-icon>Add Page</el-dropdown-item>
                            <el-dropdown-item @click="addPdf"><pm-icon icon="file-circle-plus"></pm-icon>Add PDF</el-dropdown-item>
                            <el-dropdown-item @click="addJupyterNotebook"><pm-icon icon="file-circle-plus"></pm-icon>Add Jupyter Notebook</el-dropdown-item>
                            <el-dropdown-item @click="addSubFolder"><pm-icon icon="folder-plus"></pm-icon>Add Subfolder</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="user-nav">
                <template v-if="!isLoggedIn">
                    <el-button @click="login" class="user-button">Login</el-button>
                </template>
                <template v-else>
                    <el-button @click="settings" class="user-button">
                        <pm-icon icon="user"></pm-icon>
                        <span class="text">Admin</span>
                    </el-button>
                </template>
            </div>
        </div>
        <div id="mobile-nav" v-show="!mainNavShowing" @click="showMainNav">
            <pm-icon class="nav-toggle-small" icon="caret-right"></pm-icon>
            <el-breadcrumb separator="/" class="breadcrumbs">
                <el-breadcrumb-item v-for="item in currentTitleArray">{{ item }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
    </div>
</template>

<script setup lang="ts">
import {toRaw, computed} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import PWNavElement from "@/src/components/pw/nav/nav-element.vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore, useDialogStore} from "pixlcms-wrapper";
import {isMobile} from "@/src/helpers/mobile-detector";
import {ElMessageBox} from "element-plus";
import {navigate} from "@/src/helpers/navigator";

const findListElement = (target: any): any => {
    if (target.nodeName === 'LI') {
        return target;
    }
    if (target.parentElement.nodeName === 'LI') {
        return target.parentElement;
    }
    return findListElement(target.parentElement);
}

const navElementIsFolder = (target: any) => {
    const listElement = findListElement(target);
    if (listElement.classList.contains('el-sub-menu')) {
        return true;
    }
    if (listElement.classList.contains('el-menu-item')) {
        return false;
    }
}

const dialogStore = useDialogStore();
const wikiStore = useWikiStore();
const mainStore = useMainStore();
const authStore = useAuthStore();

// created
if (isMobile()) {
    useMainStore().toggleLargeNavShowing(false);
}
useWikiStore().loadNav();

// methods
const openSubmenu = function (menuId: string) {
    console.log(menuId);
    wikiStore.openedSubmenus.push(menuId);
}

const closeSubmenu = function (menuId: string) {
    wikiStore.openedSubmenus.splice(wikiStore.openedSubmenus.indexOf(menuId), 1);
    if (wikiStore.openedSubmenus.includes(menuId)) {
        closeSubmenu(menuId);
    }
}

const settings = function () {
    dialogStore.showDialog('/settings');
}
const addSubFolder = function () {
    ElMessageBox.prompt('New Subfolder', 'Add Subfolder', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    }).then(name => {
        wikiStore.addFolder('/', name.value).then(() => {
            wikiStore.loadNav();
        });
    })
}
const addSubEntry = function () {
    ElMessageBox.prompt('New Page Title', 'Add Page', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    }).then(name => {
        wikiStore.addEntry('/', name.value).then(() => {
            wikiStore.loadNav();
        });
    })
}
const addPdf = function () {
    dialogStore.setPdfParentFolder('/');
    dialogStore.showDialog({route: '/nav/new-alternative-content', data: { id: '/', title: "New PDF", mime: "application/pdf" }});
}

const addJupyterNotebook = function () {
    dialogStore.showDialog({ route: '/nav/new-alternative-content', data: { id: '/', title: "New Notebook", mime: "application/json" }});
}
const hideMainNav = function () {
    mainStore.toggleLargeNavShowing(false);
}
const showMainNav = function () {
    mainStore.toggleLargeNavShowing(true);
}
const navClickListener = function (event: Event) {
    const isFolder = navElementIsFolder(event.target);
    if (isFolder) {
        return;
    }
    const element = findElementWithTagName(event.target, 'LI');
    const id = element.dataset.pwEntryId;
    if (id === undefined || id === null) {
        throw 'No ID found';
    }
    navigate(id);
}
const login = function () {
    dialogStore.showDialog('/auth/login');
}
const findElementWithTagName = function (element: HTMLElement, tagName: string): HTMLElement {
    if (element.tagName === tagName || element.parentElement === null) {
        return element;
    }
    return findElementWithTagName(element.parentElement, tagName);
}

// computed
const currentTitleArray = computed(() => {
    const id = wikiStore.currentEntry?.id;
    if (!id) {
        return [];
    }
    return id.split('/');
});
const canEdit = computed(() => {
    return authStore.haveEditRights();
});
const mainNavShowing = computed(() => {
    return mainStore.isLargeNavShowing;
});
const isLoggedIn = computed(() => {
    return useAuthStore().getToken !== null;
});
const nav = computed(() => {
    const wikiStore = useWikiStore()
    if (wikiStore.getNav === null) {
        return {}
    }
    return toRaw(wikiStore.getNav);
});

</script>

<style scoped lang="scss">
@import '@/style/variables';

#nav {
    background-color: var(--el-bg-color);
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    width: $navLargeWidth;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 100;
    border-right: 1px solid var(--el-menu-border-color);
}

@media screen and (max-width: $mobileBreakpoint) {
    #nav {
        width: 100%;
    }

    html.dark {
        #nav {
            background-color: rgb(20, 20, 20);
        }
    }
}

.user-nav .el-dropdown {
    width: 100%;
}

.user-button {
    width: 100%;
    height: 3rem;
    border-radius: 5px;
    margin: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    font-family: "JetBrains-Mono Regular", sans-serif;
    outline: none !important;
    border: none !important;
    font-size: 1.1rem;

    &:hover {
        background-color: var(--el-menu-hover-bg-color);
    }

    svg {
        padding-right: 5px;
    }
}

#mobile-nav {
    display: block;
    position: fixed;
    left: 0;
    background-color: var(--el-bg-color);
    min-height: 100vh;
    bottom: 0;
    width: $navSmallWidth;
    cursor: pointer;
    border-right: var(--el-border);

    .nav-toggle-small {
        position: absolute;
        top: 10px;
    }

    .breadcrumbs {
        transform: rotate(270deg) translate(-100%, 0);
        width: 100vh;
        transform-origin: top left;
    }
}

.nav-toggle {
    width: calc(100% - 40px);
    padding: 20px 20px 20px 20px;
    cursor: pointer;

    &:hover {
        background-color: var(--el-menu-hover-bg-color);
    }
}

.nav-user-dropdown {
    position: fixed;
    bottom: 3rem;
    left: 3rem;
    box-shadow: var(--box-shadow);
    min-width: 10%;
    border-radius: 10px;

    .nav-user-dropdown-button {
        width: 100%;
        display: block;
        outline: none;
        border: none;
        text-align: center;
        padding: 10px 0;
        cursor: pointer;
        border-radius: 5px;

        &:first-of-type {
            border-top-right-radius: 10px;
            border-top-left-radius: 10px;
        }

        &:last-of-type {
            border-bottom-right-radius: 10px;
            border-bottom-left-radius: 10px;
        }

        &:hover {
            background-color: var(--el-menu-hover-bg-color);
        }
    }
}

.el-menu {
    border-right: unset;
}

.el-dropdown-menu__item {
    svg {
        margin-right: 5px;
    }
}

.el-sub-menu__title {
    .submenu-title {
        margin-right: 5px;
    }
}
</style>

<style lang="scss">
.pw-submenu-title * {
    vertical-align: unset;
}
</style>
