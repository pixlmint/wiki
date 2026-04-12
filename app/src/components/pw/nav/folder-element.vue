<template>
    <div @click="triggerRenderDropdown">
        <el-sub-menu class="pw-submenu" data-is-entry="false" :index="element.id">
            <template #title>
                <pw-nav-entry-title v-loading="data.loadingRemoteSubmenu" :should-display-dropdown="canEdit" :element-id="element.id"
                    :element-title="element.title">
                    <template #indicator>
                        <pm-icon v-if="isSubmenuOpen && !data.loadingRemoteSubmenu" icon="caret-down"></pm-icon>
                        <pm-icon v-else-if="!isSubmenuOpen && !data.loadingRemoteSubmenu" icon="caret-right"></pm-icon>
                    </template>
                    <template #icons>
                        <pm-icon icon="lock" class="private-icon" v-if="!element.isPublic"></pm-icon>
                    </template>
                    <template #dropdown-options>
                        <el-dropdown-item @click="addPage">
                            <pm-icon icon="file-circle-plus"></pm-icon>
                            Add Page
                        </el-dropdown-item>
                        <el-dropdown-item @click="element.addPdf">
                            <pm-icon icon="file-circle-plus"></pm-icon>
                            Add PDF
                        </el-dropdown-item>
                        <el-dropdown-item @click="element.addJupyterNotebook">
                            <pm-icon icon="file-circle-plus"></pm-icon>
                            Add Jupyter Notebook
                        </el-dropdown-item>
                        <el-dropdown-item @click="element.addSubfolder">
                            <pm-icon icon="folder-plus"></pm-icon>
                            Add Subfolder
                        </el-dropdown-item>
                        <el-dropdown-item @click="element.addBoard">
                            <pm-icon package="brands" icon="trello"></pm-icon>
                            Add Board
                        </el-dropdown-item>
                        <el-dropdown-item @click="element.switchSecurity">
                            <pm-icon v-if="element.isPublic" icon="lock"></pm-icon>
                            <pm-icon v-else icon="unlock"></pm-icon>
                            {{ securitySwitchText }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="addLink">Add Link</el-dropdown-item>
                        <el-dropdown-item class="danger" @click="element.deleteFolder"><pm-icon
                                icon="trash"></pm-icon>Delete</el-dropdown-item>
                    </template>
                </pw-nav-entry-title>
            </template>
            <template v-if="shouldRenderChildren">
                <template v-for="(childElement, myIndex) in children" :key="myIndex">
                    <PWNavElement :element="childElement" v-if="childElement.isPublic || canEdit"></PWNavElement>
                </template>
            </template>
        </el-sub-menu>
    </div>
</template>

<script lang="ts" setup>
import { ILinkNavElement, isFolder, isLink, loadRemoteNav } from "@/src/helpers/nav";
import { computed, onMounted, reactive, watch, onBeforeUnmount } from "vue";
import { useWikiStore } from "@/src/stores/wiki";
import PWNavElement from "@/src/components/pw/nav/nav-element.vue";
import * as feService from "@/src/services/feService";
import { ElMessageBox } from "element-plus";
import { IFolderNavElement } from "pixlcms-wrapper";
import { NavChangedEvent } from "pixlcms-wrapper/src/events";


// TODO: Still calling old-style element.xxx functions

const { element, canEdit } = defineProps<{ element: IFolderNavElement | ILinkNavElement, canEdit: boolean }>();

const wikiStore = useWikiStore();

const data = reactive({
    hoveredOverSubmenu: false,
    submenuOpened: false,
    childrenLoaded: false,
    loadingRemoteSubmenu: false,
    navUpdateTriggers: 0,
});

const triggerRenderDropdown = function () {
    console.log("rendering submenu", element.id);
    data.hoveredOverSubmenu = true;
}


const shouldRenderChildren = computed(() => (isLink(element) && data.hoveredOverSubmenu && data.childrenLoaded) || (isFolder(element) && data.hoveredOverSubmenu));

const isSubmenuOpen = computed(() => {
    return wikiStore.openedSubmenus.indexOf(element.id) !== -1;
});

const children = computed(() => {
    data.navUpdateTriggers;
    return element.children ?? []
});

//if (element instanceof LinkNavElement) {
if (isLink(element)) {
    watch(isSubmenuOpen, (val) => {
        if (val && !data.childrenLoaded) {
            data.loadingRemoteSubmenu = true;
            loadRemoteNav(element).then(() => {
                data.childrenLoaded = true;
                data.loadingRemoteSubmenu = false;
            });
        }
    });
}

onMounted(() => {
    window.addEventListener('navchanged', onNavChanged);
    if (isFolder(element)) {
        data.childrenLoaded = true;
    }
});


onBeforeUnmount(() => {
    window.removeEventListener('navchanged', onNavChanged);
})


function onNavChanged(event: NavChangedEvent) {
    if (event.entry === element.id) {
        console.log('onNavChanged', element.id);
        data.navUpdateTriggers++;
    } else {
        console.log('notOnNavChanged', element.id);
    }
}

const addPage = function () {
    ElMessageBox.prompt('New Page Title', 'Add Page', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    }).then(name => {
        feService.addPage(element, name.value);
    });
}

const addLink = function () {
    feService.addLink(element);
}

const securitySwitchText = computed(() => {
    if (element.isPublic) {
        return 'Set Private';
    } else {
        return 'Set Public';
    }
});
</script>
