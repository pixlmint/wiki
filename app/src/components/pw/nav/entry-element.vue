<template>
    <el-menu-item class="pw-menu-item" data-is-entry="true" :index="element.id">
        <pw-nav-entry-title v-loading="loading" :element-id="element.id" :should-display-dropdown="canEdit"
            :element-title="element.title">
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
                <dropdown-options :element="element" :create-actions="createEntryActions" @start-loading="loading = true" @end-loading="loading = false" />
            </template>
        </pw-nav-entry-title>
    </el-menu-item>
</template>

<script lang="ts" setup>
import { type INavElement } from "pixlcms-wrapper";
import { ref } from "vue";
import dropdownOptions from "./dropdown-options.vue";

import { createEntryActions } from "@/src/services/dropdownElements";

const { element, canEdit } = defineProps<{ element: INavElement, canEdit: boolean }>();

const loading = ref(false);
</script>
