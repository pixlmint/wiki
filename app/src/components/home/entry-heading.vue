<template>
    <div class="article-head">
        <div class="d-flex" style="align-items: center; gap: 1rem;">
            <div>
                <el-breadcrumb separator="/" class="breadcrumbs print-visible">
                    <el-breadcrumb-item v-for="item in currentTitleArray">{{ item }}</el-breadcrumb-item>
                </el-breadcrumb>
                <h1>
                    <slot name="title">{{ title }}</slot>
                </h1>
            </div>
            <pm-icon v-if="!isPublic" title="This Entry is Private, only you can see it" icon="lock"></pm-icon>
            <slot name="title-extras"></slot>
        </div>
        <div v-if="canEdit" class="print-invisible">
            <el-dropdown split-button trigger="click" @click="handleClick">
            <pm-icon :icon="dropdownActions.primaryAction.elIcon" v-if="typeof dropdownActions.primaryAction.elIcon === 'string'"></pm-icon>
            <pm-icon :icon="dropdownActions.primaryAction.elIcon.icon" :package="dropdownActions.primaryAction.elIcon.package"
                v-else-if="typeof dropdownActions.primaryAction.elIcon === 'object'"></pm-icon>
                <template #dropdown>
                    <EntryHeadingDropdownAction v-for="item, index in dropdownActions.actions" :key="index" :action="item" />
                    <slot name="actions-extra"></slot>
                    <!--<el-dropdown-item v-if="props.displayViewMarkdownButton" @click="viewMarkdown" title="View">
                        <pm-icon icon="markdown" package="brands"></pm-icon>
                        <span>Show Markdown</span>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="props.displayMediaButtons" @click="uploadMedia" title="Media">
                        <pm-icon icon="image"></pm-icon>
                        <span>Media</span>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="props.displayMediaButtons" @click="addDrawing" title="Add Drawing">
                        <pm-icon icon="pen-ruler"></pm-icon>
                        <span>Add Drawing</span>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="props.displayDeleteButton" class="danger" @click="deleteEntry"
                        title="Delete">
                        <pm-icon icon="trash"></pm-icon>
                        <span>Delete</span>
                    </el-dropdown-item>-->
                </template>
            </el-dropdown>
        </div>
    </div>
    <DrawModal v-if="isDrawing"></DrawModal>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useWikiStore } from "@/src/stores/wiki";
import { useAuthStore, useDialogStore, useMediaStore } from "pixlcms-wrapper";
import { queryFormatter } from "@/src/helpers/queryFormatter";
import DrawModal from "@/src/components/admin/Editor/DrawModal.vue";
import feService from "@/src/services/feService";
import { DropdownConfig } from "@/src/helpers/entry-heading-dropdown-items";
import EntryHeadingDropdownAction from '@/src/components/home/entry-heading-dropdown-action.vue';

const props = defineProps<{ dropdownActions: DropdownConfig }>();

const handleClick = function() {
    props.dropdownActions.primaryAction.onClick(useWikiStore().currentEntry);
}

/*
const props = defineProps({
    displayEditButton: {
        type: Boolean,
        default: true,
    },
    displayDeleteButton: {
        type: Boolean,
        default: true,
    },
    displayMediaButtons: {
        type: Boolean,
        default: true,
    },
    displayViewMarkdownButton: {
        type: Boolean,
        default: true,
    },
});*/

const wikiStore = useWikiStore();
const authStore = useAuthStore();
const dialogStore = useDialogStore();
const mediaStore = useMediaStore();

const title = computed(() => {
    return wikiStore.currentEntry!.meta.title;
});

const editEntry = function () {
    // const entry = wikiStore.currentEntry;
    wikiStore.editEntry(wikiStore.currentEntry);
    // console.log(entry);
    // let id = entry.id;
    // if (typeof entry.originalId !== 'undefined')
    //     id = entry.originalId;
    // else
    //     id = entry.id;
    // navigate('/admin/edit?p=' + id);
}

/*
const viewMarkdown = function () {
    const query = queryFormatter({ token: authStore.token, entry: wikiStore.currentEntry!.id });
    window.open(location.origin + "/api/admin/entry/view-markdown?" + query, "_blank");
}

const deleteEntry = function () {
    const doDelete = confirm(`Are you sure you want to delete ${wikiStore.currentEntry!.meta.title}`);
    if (doDelete) {
        feService.delete(wikiStore.currentEntry);
        // wikiStore.deleteEntry(wikiStore.currentEntry!.id).then(() => {
        //     wikiStore.loadNav();
        //     navigate('/');
        // });
    }
}

const uploadMedia = function () {
    mediaStore.loadMediaForEntry(wikiStore.currentEntry!.id);
    dialogStore.showDialog("/media");
}

const addDrawing = function () {
    dialogStore.showDialog("/draw");
}*/

const isDrawing = computed(() => {
    return dialogStore.isDialogShowing("/draw");
});

const isPublic = computed(() => {
    return wikiStore.currentEntry!.meta.security !== 'private';
});

const currentTitleArray = computed(() => {
    const id = wikiStore.currentEntry!.id;
    if (!id) {
        return [];
    }
    return id.split('/');
});

const canEdit = computed(() => {
    return authStore.haveEditRights();
});
</script>
