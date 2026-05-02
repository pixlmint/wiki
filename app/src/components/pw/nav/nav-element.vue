<template>
    <component :data-pw-entry-id="element.id" v-bind:is="getComponent()" :element="element" :canEdit="canEdit" />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import FolderElement from "@/src/components/pw/nav/folder-element.vue";
import { type INavElement } from "pixlcms-wrapper";
import { isFolder, isLink } from "@/src/helpers/nav";
import EntryElement from "@/src/components/pw/nav/entry-element.vue";
import { useWikiStore } from "@/src/stores/wiki";

const { element } = defineProps<{
    element: INavElement,
}>();

const getComponent = function () {
    if (isFolder(element) || isLink(element)) {
        return FolderElement;
    }
    // if (element instanceof FolderNavElement || element instanceof LinkNavElement) {
    //     return FolderElement;
    // }
    return EntryElement;
}

const canEdit = computed(() => {
    return useWikiStore().isAuthenticated;
});
</script>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: 'PWNavElement',
});
</script>

<style lang="scss">
.nav-wrapper {
    .private-icon {
        color: var(--el-text-color-secondary);
    }
}

li.el-sub-menu {
    .el-sub-menu__title>i.el-icon {
        display: none;
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
</style>
