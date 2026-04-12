<template>
    <el-menu-item class="pw-menu-item" data-is-entry="true"
        :index="element.id">
        <pw-nav-entry-title v-loading="loading" :element-id="element.id" :should-display-dropdown="canEdit" :element-title="element.title">
            <template #icons>
                <el-tag type="info" v-if="element.kind === 'board'">
                    <pm-icon icon="trello" package="brands"></pm-icon>
                </el-tag>
                <el-tag type="danger" v-else-if="element.kind === 'pdf'">
                    <pm-icon icon="file-pdf"></pm-icon>
                </el-tag>
                <el-tag v-else-if="element.kind === 'ipynb'">
                    <img width="12" heigth="12" src="/assets/jupyter.svg">
                </el-tag>
                <pm-icon icon="lock" class="private-icon" v-if="!element.isPublic"></pm-icon>
            </template>
            <template #dropdown-options>
                <el-dropdown-item @click="edit"><pm-icon icon="pen"></pm-icon>Edit</el-dropdown-item>
                <el-dropdown-item @click="element.rename"><pm-icon
                        icon="pen-to-square"></pm-icon>Rename</el-dropdown-item>
                <el-dropdown-item @click="element.switchSecurity">
                    <pm-icon v-if="element.isPublic" icon="lock"></pm-icon>
                    <pm-icon v-else icon="unlock"></pm-icon>
                    {{ securitySwitchText }}
                </el-dropdown-item>
                <el-dropdown-item class="danger" @click="deleteWithConfirm"><pm-icon
                        icon="trash"></pm-icon>Delete</el-dropdown-item>
            </template>
        </pw-nav-entry-title>
    </el-menu-item>
</template>

<script lang="ts" setup>
import { type INavElement } from "pixlcms-wrapper";
import { computed, ref } from "vue";
import * as feService from "@/src/services/feService";
import { ElMessageBox } from "element-plus";

const { element, canEdit } = defineProps<{ element: INavElement, canEdit: boolean }>();

const loading = ref(false);


const edit = feService.edit;
const deleteWithConfirm = function() {
    ElMessageBox.confirm(
        `delete ${element.id}?`,
        'Danger',
        {
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            type: 'danger',
        },
    ).then(async () => {
        loading.value = true;
        await feService.delete(element);
        loading.value = false;
    })
}

const securitySwitchText = computed(() => {
    if (element.isPublic) {
        return 'Set Private';
    } else {
        return 'Set Public';
    }
});
</script>
