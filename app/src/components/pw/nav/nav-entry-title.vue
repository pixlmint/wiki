<template>
    <div class="pw-submenu-title">
        <span class="indicator">
            <slot name="indicator"></slot>
        </span>
        <div class="nav-title" :title="elementTitle">
            <slot name="title"></slot>
        </div>
        <el-dropdown class="nav-dropdown" v-if="props.shouldDisplayDropdown">
            <el-button circle text>
                <pm-icon icon="ellipsis"></pm-icon>
            </el-button>
            <template #dropdown>
                <slot name="dropdown-options"></slot>
            </template>
        </el-dropdown>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    elementId: {
        type: [String, Number],
        required: true,
    },
    elementTitle: {
        type: String,
        required: true,
    },
    shouldDisplayDropdown: Boolean,
});
</script>

<style lang="scss">
.nav-title {
    .submenu-title {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.el-menu-item, .el-sub-menu__title {
    padding-right: 0 !important;
}

.pw-submenu-title {
    display: flex;
    align-items: center;
    width: 100%;

    .indicator {
        width: 5%;

    }

    .nav-title {
        width: 80%;
        display: flex;
        align-items: center;
    }

    .nav-dropdown {
        width: 10%;
    }
}
</style>