<template>
    <el-card @click="viewCard" class="item" shadow="hover">
        {{ props.cardData.meta.title }}
        <div class="labels">
            <card-label v-for="(label, index) in labels" :label="label" :key="index"></card-label>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import {useDialogStore} from "pixlcms-wrapper";
import {route} from '@/src/components/kanban/card-modal.vue';
import CardLabel from "@/src/components/kanban/card-label.vue";
import {computed} from "vue";

const dialogStore = useDialogStore();

const props = defineProps({
    cardData: {
        type: Object,
        required: true,
    },
});

const labels = computed(() => {
    if (!('card' in props.cardData.meta) || !('labels' in props.cardData.meta.card)) {
        return [];
    }

    return props.cardData.meta.card.labels
});

const viewCard = function () {
    dialogStore.showDialog({
        route: route,
        data: props.cardData,
    });
}
</script>

<style scoped lang="scss">
.item {
    position: relative;
    padding-bottom: 10px;

    .labels {
        position: absolute;
        bottom: 0;
        right: 0;
    }
}
</style>