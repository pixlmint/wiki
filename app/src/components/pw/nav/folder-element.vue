<template>
    <div @click="triggerRenderDropdown">
        <el-sub-menu class="pw-submenu" data-is-entry="false" :index="element.id">
            <template #title>
                <pw-nav-entry-title :should-display-dropdown="canEdit" :element-id="element.id"
                    :element-title="element.title">
                    <template #indicator>
                        <pm-icon v-if="isSubmenuOpen" icon="caret-down"></pm-icon>
                        <pm-icon v-else icon="caret-right"></pm-icon>
                    </template>
                    <template #icons>
                        <pm-icon icon="lock" class="private-icon" v-if="!element.isPublic"></pm-icon>
                    </template>
                    <template #dropdown-options>
                        <el-dropdown-item @click="element.addPage">
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
                        <el-dropdown-item @click="element.addLink">Add Link</el-dropdown-item>
                        <el-dropdown-item class="danger" @click="element.deleteFolder"><pm-icon
                                icon="trash"></pm-icon>Delete</el-dropdown-item>
                    </template>
                </pw-nav-entry-title>
            </template>
            <template v-if="data.hoveredOverSubmenu && data.childrenLoaded">
                <template v-for="(childElement, myIndex) in element.getChildren()" :key="myIndex">
                    <PWNavElement :element="childElement" v-if="childElement.isPublic || canEdit"></PWNavElement>
                </template>
            </template>
        </el-sub-menu>
    </div>
</template>

<script lang="ts" setup>
import { FolderNavElement, LinkNavElement } from "@/src/helpers/nav";
import { computed, onMounted, reactive, watch } from "vue";
import { useWikiStore } from "@/src/stores/wiki";
import PWNavElement from "@/src/components/pw/nav/nav-element.vue";

const { element, canEdit } = defineProps<{ element: FolderNavElement | LinkNavElement, canEdit: boolean }>();

const wikiStore = useWikiStore();

const data = reactive({
    hoveredOverSubmenu: false,
    submenuOpened: false,
    childrenLoaded: false,
});

const triggerRenderDropdown = function () {
    console.log("rendering submenu", element.id);
    data.hoveredOverSubmenu = true;
}

const isSubmenuOpen = computed(() => {
    return wikiStore.getOpenedSubmenus.indexOf(element.id) !== -1;
});

if (element instanceof LinkNavElement) {
    watch(isSubmenuOpen, (val) => {
        if (val && !data.childrenLoaded) {
            element.loadRemoteNav().then(() => {
                data.childrenLoaded = true;
            });
        }
    });
}

onMounted(() => {
    if (element instanceof FolderNavElement) {
        data.childrenLoaded = true;
    }
});

const securitySwitchText = computed(() => {
    if (element.isPublic) {
        return 'Set Private';
    } else {
        return 'Set Public';
    }
});
</script>
