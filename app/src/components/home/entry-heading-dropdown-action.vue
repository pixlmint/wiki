<template>
    <el-dropdown-item @click="handleClick"
        :title="action.title" :class="classExtra">
        <pm-icon :icon="action.elIcon" v-if="typeof action.elIcon === 'string'"></pm-icon>
        <pm-icon :icon="action.elIcon.icon" :package="action.elIcon.package"
            v-if="typeof action.elIcon === 'object'"></pm-icon>
        <span>{{ action.title }}</span>
    </el-dropdown-item>
</template>

<script lang="ts" setup>
import { DropdownConfig } from "@/src/helpers/entry-heading-dropdown-items";
import { computed } from "vue";
import { useWikiStore } from "@/src/stores/wiki";
const props = defineProps<{ action: DropdownConfig }>();

const handleClick = function() {
    props.action.onClick(useWikiStore().currentEntry);
}

const classExtra = computed(() => {
    return (typeof props.action.class === 'string') ? props.action.class : '';
});
</script>
