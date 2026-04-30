<template>
    <template v-for="config, index in actions" :key="index">
        <el-dropdown-item @click="config.action" :class="config.className">
            <pm-icon v-if="typeof (config.icon) === 'string'" :icon="config.icon"></pm-icon>
            <pm-icon v-else-if="typeof (config.icon) === 'object' && 'package' in config.icon"
                :package="config.icon.package" :icon="config.icon.icon"></pm-icon>
            <component v-else-if="typeof (config.iconElement) !== 'undefined'" :is="config.iconElement"></component>
            {{ config.title }}
        </el-dropdown-item>
    </template>
</template>

<script lang="ts" setup>
import { ILinkNavElement } from '@/src/helpers/nav';
import { IFolderNavElement, INavElement } from 'pixlcms-wrapper';

import type { DropdownElementConfiguration } from '@/src/services/dropdownElements';

const { element, createActions } = defineProps<{
    element: IFolderNavElement | ILinkNavElement | INavElement,
    createActions: (element: IFolderNavElement | ILinkNavElement | INavElement, toggleLoading: (isLoading: boolean) => void) => DropdownElementConfiguration[],
}>();


const emit = defineEmits<{ startLoading: {}, endLoading: {} }>();

const actions = createActions(element, (isLoading: boolean) => {
    if (isLoading) emit("startLoading")
    else emit("endLoading")
});
</script>
