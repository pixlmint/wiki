<template>
    <div class="article-head">
        <div class="d-flex" style="align-items: center; gap: 1rem;">
            <div>
                <el-breadcrumb separator="/" class="breadcrumbs print-visible">
                    <el-breadcrumb-item v-for="item in currentTitleArray">{{ item }}</el-breadcrumb-item>
                </el-breadcrumb>
                <h1><slot name="title">{{ title }}</slot></h1>
            </div>
            <pm-icon v-if="!isPublic" title="This Entry is Private, only you can see it" icon="lock"></pm-icon>
            <slot name="title-extras"></slot>
        </div>
        <div v-if="canEdit" class="print-invisible">
            <el-dropdown class="mobile-action-buttons">
                <el-button circle>
                    <pm-icon icon="ellipsis"></pm-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-item v-if="props.displayViewMarkdownButton" @click="viewMarkdown" title="View">
                        <pm-icon icon="markdown" package="brands"></pm-icon>
                        <span>Show Markdown</span>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="props.displayEditButton" @click="editEntry" title="Edit">
                        <pm-icon icon="pen-to-square"></pm-icon>
                        <span>Edit</span>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="props.displayDeleteButton" class="danger" @click="deleteEntry" title="Delete">
                        <pm-icon icon="trash"></pm-icon>
                        <span>Delete</span>
                    </el-dropdown-item>
                </template>
            </el-dropdown>
            <div class="desktop-action-buttons">
                <el-dropdown split-button type="secondary" trigger="click" @click="editEntry">
                    <pm-icon icon="pen-to-square"></pm-icon>
                    <template #dropdown>
                        <slot name="actions-extra"></slot>
                        <el-dropdown-item v-if="props.displayViewMarkdownButton" @click="viewMarkdown" title="View">
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
                        <el-dropdown-item v-if="props.displayDeleteButton" class="danger" @click="deleteEntry" title="Delete">
                            <pm-icon icon="trash"></pm-icon>
                            <span>Delete</span>
                        </el-dropdown-item>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </div>
    <DrawModal v-if="isDrawing"></DrawModal>
</template>
<script setup lang="ts">
import {computed, ref} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import {useAuthStore, useDialogStore, useMediaStore} from "pixlcms-wrapper";
import {queryFormatter} from "@/src/helpers/queryFormatter";
import {navigate} from "@/src/helpers/navigator";
import DrawModal from "@/src/components/admin/Editor/DrawModal.vue";

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
});

const wikiStore = useWikiStore();
const authStore = useAuthStore();
const dialogStore = useDialogStore();
const mediaStore = useMediaStore();

const title = computed(() => {
    return wikiStore.safeCurrentEntry.meta.title;
});

const editEntry = function () {
    navigate('/admin/edit?p=' + wikiStore.safeCurrentEntry.id);
}

const viewMarkdown = function () {
    const query = queryFormatter({token: authStore.token, entry: wikiStore.safeCurrentEntry.id});
    window.open(location.origin + "/api/admin/entry/view-markdown?" + query, "_blank");
}

const deleteEntry = function () {
    const doDelete = confirm(`Are you sure you want to delete ${wikiStore.safeCurrentEntry.meta.title}`);
    if (doDelete) {
        useWikiStore().deleteEntry(wikiStore.safeCurrentEntry.id).then(() => {
            useWikiStore().loadNav();
            useWikiStore().fetchEntry('/');
            navigate('/');
        });
    }
}

const uploadMedia = function() {
    mediaStore.loadMediaForEntry(wikiStore.safeCurrentEntry.id);
    dialogStore.showDialog("/media"); 
}

const addDrawing = function() {
    dialogStore.showDialog("/draw");
}

const isDrawing = computed(() => {
    return dialogStore.isDialogShowing("/draw");
});

const isPublic = computed(() => {
    return wikiStore.safeCurrentEntry.meta.security !== 'private';
});

const currentTitleArray = computed(() => {
    const id = wikiStore.safeCurrentEntry.id;
    if (!id) {
        return [];
    }
    return id.split('/');
});

const canEdit = computed(() => {
    return authStore.haveEditRights();
});
</script>
