<template>
    <component :data-pw-entry-id="element.id" v-bind:is="getComponent()" :element="element" :canEdit="canEdit" />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useAuthStore } from "pixlcms-wrapper";
import FolderElement from "@/src/components/pw/nav/folder-element.vue";
import { FolderNavElement, LinkNavElement, NavElement } from "@/src/helpers/nav";
import EntryElement from "@/src/components/pw/nav/entry-element.vue";

const { element } = defineProps<{
    element: NavElement,
}>();

const authStore = useAuthStore();

const getComponent = function () {
    if (element instanceof FolderNavElement || element instanceof LinkNavElement) {
        return FolderElement;
    }
    return EntryElement;
}

const canEdit = computed(() => {
    return authStore.haveEditRights();
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
