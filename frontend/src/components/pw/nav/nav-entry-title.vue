<template>
    <div class="pw-submenu-title">
        <span class="indicator">
            <slot name="indicator"></slot>
        </span>
        <div class="nav-title" ref="titleElement" :title="elementTitle">
            <span class="submenu-title d-flex gap-2 align-items-center">
                <span class="submenu-title-actual" :style="'max-width: ' + titleElementWidth.value + 'px; text-overflow: ellipsis; overflow: hidden;'">
                    {{ title }}
                </span>
                <span ref="iconsWrapper">
                    <slot name="icons"></slot>
                </span>
            </span>
        </div>
        <el-dropdown class="nav-dropdown" v-if="props.shouldDisplayDropdown">
            <el-button class="nav-dropdown-button" circle text>
                <pm-icon icon="ellipsis"></pm-icon>
            </el-button>
            <template #dropdown>
                <slot name="dropdown-options"></slot>
            </template>
        </el-dropdown>
    </div>
</template>

<script lang="ts" setup>
import { computed, useSlots, ref, onMounted, reactive } from 'vue';

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

const slots = useSlots();

const titleElement = ref<HTMLElement>();
const iconsWrapper = ref<HTMLSpanElement>();

const titleElementWidth = reactive({
    value: 0,
});

const title = computed(() => {
    return props.elementTitle;
});

const iconCount = computed(() => {
    let cnt = 0;
    if (slots.firstIcon !== null) cnt++;
    if (slots.secondIcon !== null) cnt++;
    return cnt;
});

onMounted(() => {
    titleElementWidth.value = titleElement.value!.clientWidth;
    titleElementWidth.value -= iconsWrapper.value!.clientWidth;
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

.nav-dropdown-button {
    width: 25px;
    height: 25px;

    &:focus-visible {
        outline: unset !important;
    }
}
</style>
