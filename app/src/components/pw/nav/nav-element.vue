<template>
    <div @click="triggerRenderDropdown">
        <el-sub-menu v-if="isFolder" class="pw-submenu" data-is-entry="false" :index="element.id">
            <template #title>
                <pw-nav-entry-title :should-display-dropdown="canEdit" :element-id="element.id" :element-title="element.title">
                    <template #indicator>
                        <pm-icon v-if="isSubmenuOpen" icon="caret-down"></pm-icon>
                        <pm-icon v-else icon="caret-right"></pm-icon>
                    </template>
                    <template #title>
                        <span class="submenu-title">{{ element.title }}</span>
                        <pm-icon icon="lock" class="private-icon" v-if="!isPublic"></pm-icon>
                    </template>
                    <template #dropdown-options>
                        <el-dropdown-item @click="addPage"><pm-icon icon="file-circle-plus"></pm-icon>Add Page</el-dropdown-item>
                        <el-dropdown-item @click="addPdf"><pm-icon icon="file-circle-plus"></pm-icon>Add PDF</el-dropdown-item>
                        <el-dropdown-item @click="addSubfolder"><pm-icon icon="folder-plus"></pm-icon>Add Subfolder</el-dropdown-item>
                        <el-dropdown-item @click="addBoard"><pm-icon package="brands" icon="trello"></pm-icon>Add Board</el-dropdown-item>
                        <el-dropdown-item @click="switchSecurity">
                            <pm-icon v-if="isPublic" icon="lock"></pm-icon>
                            <pm-icon v-else icon="unlock"></pm-icon>
                            {{ securitySwitchText }}
                        </el-dropdown-item>
                        <el-dropdown-item class="danger" @click="deleteFolder"><pm-icon icon="trash"></pm-icon>Delete</el-dropdown-item>
                    </template>
                </pw-nav-entry-title>
            </template>
            <template v-for="(childElement, myIndex) in element.children" :key="myIndex" v-if="data.hoveredOverSubmenu">
                <PWNavElement :element="childElement" v-if="childElement.isPublic || canEdit"></PWNavElement>
            </template>
        </el-sub-menu>
        <el-menu-item v-else :data-pw-entry-id="element.id" class="pw-menu-item" data-is-entry="true" :index="element.id">
            <pw-nav-entry-title :element-id="element.id" :should-display-dropdown="canEdit" :element-title="element.title">
                <template #title>
                    <div class="d-flex align-items-center gap-2">
                        <span class="submenu-title">{{ element.title }}</span>
                        <el-tag type="info" v-if="element.kind === 'board'"><pm-icon icon="trello" package="brands"></pm-icon></el-tag>
                        <el-tag type="danger" v-if="element.kind === 'pdf'"><pm-icon icon="file-pdf"></pm-icon></el-tag>
                        <pm-icon icon="lock" class="private-icon" v-if="!isPublic"></pm-icon>
                    </div>
                </template>
                <template #dropdown-options>
                    <el-dropdown-item @click="edit"><pm-icon icon="pen"></pm-icon>Edit</el-dropdown-item>
                    <el-dropdown-item @click="rename"><pm-icon icon="pen-to-square"></pm-icon>Rename</el-dropdown-item>
                    <el-dropdown-item @click="switchSecurity">
                        <pm-icon v-if="isPublic" icon="lock"></pm-icon>
                        <pm-icon v-else icon="unlock"></pm-icon>
                        {{ securitySwitchText }}
                    </el-dropdown-item>
                    <el-dropdown-item class="danger" @click="deletePage"><pm-icon icon="trash"></pm-icon>Delete</el-dropdown-item>
                </template>
            </pw-nav-entry-title>
        </el-menu-item>
    </div>
</template>

<script lang="ts" setup>
import {computed, reactive} from "vue";
import {useWikiStore} from "@/stores/wiki";
import {ElMessageBox} from "element-plus";
import {useAuthStore, useDialogStore} from "pixlcms-wrapper";
import {useMainStore} from "@/stores/main";
import {useBoardStore} from "@/stores/board";
import {navigate} from "@/helpers/navigator";
import PwNavEntryTitle from "@/components/pw/nav/nav-entry-title.vue";

const {element} = defineProps<{
    element: NavElement,
}>();

type NavElement = {
    isFolder: boolean,
    isPublic: boolean,
    kind: string,
    id: string,
    title: string,
    children: NavElement[],
};

const wikiStore = useWikiStore();
const token = useAuthStore().getToken;
const dialogStore = useDialogStore();
const boardStore = useBoardStore();
const authStore = useAuthStore();

const data = reactive({
    hoveredOverSubmenu: false,
    submenuOpened: false,
});

const isSubmenuOpen = computed(() => {
    return wikiStore.getOpenedSubmenus.indexOf(element.id) !== -1;
});

const isFolder = computed(() => {
    return element && element.isFolder && element.kind === 'plain';
});

const canEdit = computed(() => {
    return authStore.haveEditRights();
});

const isPublic = computed(() => {
    return element && element.isPublic;
});

const securitySwitchText = computed(() => {
    if (isPublic) {
        return 'Set Private';
    } else {
        return 'Set Public';
    }
});

const triggerRenderDropdown = function () {
    data.hoveredOverSubmenu = true;
}

const edit = function () {
    const currentRoute = location.pathname;
    navigate('/admin/edit?p=' + element.id);
    if (currentRoute === '/admin/edit') {
        useWikiStore().fetchEntry(element.id).then(() => {
            const title = "Edit " + useWikiStore().safeCurrentEntry.meta.title;
            useMainStore().setTitle(title)
        });
    }
}

const rename = function () {
    ElMessageBox.prompt('Pick a new Name', 'Rename', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        inputValue: element.title,
    }).then(name => {
            wikiStore.renameEntry(name.value).then(() => {
                wikiStore.loadNav();
            });
        })
}

const deletePage = function () {
    ElMessageBox.confirm('Are you sure you want to delete this page?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    }).then(() => {
            wikiStore.deleteEntry(element.id).then(() => {
                wikiStore.loadNav();
            });
        });
}

const switchSecurity = function () {
    const newState = isPublic ? 'private' : 'public';
    element.isPublic = !element.isPublic;
    wikiStore.setSecurityState(element.id, newState).then(() => {
        wikiStore.loadNav();
    });
}

const deleteFolder = function () {
    ElMessageBox.confirm('Are you sure you want to delete this folder and everything within it?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    }).then(() => {
            wikiStore.deleteFolder(element.id, token).then(() => {
                wikiStore.loadNav();
            });
        });
}

const addPage = function () {
    ElMessageBox.prompt('New Page Title', 'Add Page', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    }).then(name => {
            wikiStore.addEntry(element.id, name.value).then(() => {
                wikiStore.loadNav();
            });
        });
}

const addBoard = function () {
    ElMessageBox.prompt('New Board', 'Add Board', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    }).then(name => {
            boardStore.createBoard(element.id, name.value).then(() => {
                wikiStore.loadNav();
            });
        });
}

const addPdf = function () {
    dialogStore.showDialog({route: '/nav/new-pdf', data: element.id});
}

const addSubfolder = function () {
    ElMessageBox.prompt('New Subfolder', 'Add Subfolder', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    }).then(name => {
            wikiStore.addFolder(element.id, name.value).then(() => {
                wikiStore.loadNav();
            });
        });
}
</script>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: 'PWNavElement',
});
</script>

<style scoped lang="scss">
.el-dropdown {
    button {
        margin-left: 1rem;
    }
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

.private-icon {
    color: var(--el-text-color-secondary);
}
</style>

<style lang="scss">
li.el-sub-menu {
    .el-sub-menu__title > i.el-icon {
        display: none;
    }
}

.el-sub-menu__title * {
    vertical-align: unset;
}
</style>
