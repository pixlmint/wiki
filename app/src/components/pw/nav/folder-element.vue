<template>
    <div @click="triggerRenderDropdown">
        <el-sub-menu class="pw-submenu" data-is-entry="false" :index="element.id">
            <template #title>
                <pw-nav-entry-title v-loading="loading" :should-display-dropdown="canEdit" :element-id="element.id"
                    :element-title="element.title">
                    <template #indicator>
                        <pm-icon v-if="isSubmenuOpen && !loading" icon="caret-down"></pm-icon>
                        <pm-icon v-else-if="!isSubmenuOpen && !loading" icon="caret-right"></pm-icon>
                    </template>
                    <template #icons>
                        <pm-icon icon="lock" class="private-icon" v-if="!element.isPublic"></pm-icon>
                    </template>
                    <template #dropdown-options>
                        <dropdown-options :element="element" :create-actions="createFolderActions" @start-loading="loading = true" @end-loading="loading = false" />
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
import { computed, onMounted, reactive, watch, onBeforeUnmount, ref } from "vue";
import { useWikiStore } from "@/src/stores/wiki";
import PWNavElement from "@/src/components/pw/nav/nav-element.vue";
import { IFolderNavElement } from "pixlcms-wrapper";
import { NavChangedEvent } from "pixlcms-wrapper/src/events";
import { createFolderActions } from "@/src/services/dropdownElements";
import dropdownOptions from "./dropdown-options.vue";

const { element, canEdit } = defineProps<{ element: IFolderNavElement | ILinkNavElement, canEdit: boolean }>();

const wikiStore = useWikiStore();

const loading = ref(false);

const data = reactive({
    hoveredOverSubmenu: false,
    submenuOpened: false,
    childrenLoaded: false,
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
            loading.value = true;
            loadRemoteNav(element).then(() => {
                data.childrenLoaded = true;
                // data.loadingRemoteSubmenu = false;
                loading.value = false;
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

</script>
