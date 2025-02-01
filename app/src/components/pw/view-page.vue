<template>
    <div
        :class="{'article-width': !fullWidthPage, 'full-width': fullWidthPage, 'large-nav': isLargeNavShowing, 'small-nav': !isLargeNavShowing, 'main-content': true}">
        <div class="article">
            <div class="article-body">
                <slot name="heading">

                </slot>
                <slot name="content">

                </slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {useMainStore} from "@/stores/main";

const mainStore = useMainStore();

const props = defineProps({
    fullWidthPage: {
        type: Boolean,
        default: false,
    },
});

const isLargeNavShowing = computed(() => {
    return mainStore.isLargeNavShowing;
})
</script>
