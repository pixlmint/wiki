<template>
    <pw-view-page :style="additionalStyle" class="board-view-page" :full-width-page="true">
        <template #heading>
            <entry-heading class="board-heading" :display-delete-button="true" :display-edit-button="false" :display-view-markdown-button="false">
                <template #title-extras>
                    <el-tag><pm-icon icon="trello" package="brands"></pm-icon></el-tag>
                </template>
                <template #actions-extra>
                    <el-button @click="boardSettings"><pm-icon icon="gear"></pm-icon></el-button>
                </template>
            </entry-heading>
        </template>
        <template #content>
            <board :board-id="boardId"></board>
        </template>
    </pw-view-page>
</template>

<script lang="ts" setup>
import board from '@/src/components/kanban/board.vue';
import EntryHeading from "@/src/components/home/entry-heading.vue";
import PmIcon from "pixlcms-wrapper/src/components/icon.vue";
import {useDialogStore} from "pixlcms-wrapper";
import {route} from "@/src/components/kanban/board-settings.vue";
import {computed} from "vue";
import {useBoardStore} from "@/src/stores/board";

const props = defineProps(['boardId']);

const dialogStore = useDialogStore();
const boardStore = useBoardStore();

const additionalStyle = computed(() => {
    if (boardStore.loadedBoard === null) {
        return '';
    }

    const meta = boardStore.loadedBoard.meta;

    if (meta.board.background === undefined) {
        return '';
    }

    return 'background-image: url("' + meta.board.background + '");';
});

const boardSettings = function () {
    dialogStore.showDialog(route);
}
</script>

<style lang="scss">
html.dark {
    .board-view-page .board-heading, .board .board-list {
        background-color: transparentize(#1a1a1a, 0.1);
    }
}
html:not(.dark) {
    .board-view-page .board-heading, .board .board-list {
        background-color: transparentize(rgb(243, 243, 243), 0.1);
    }
}

h1 {
    margin: .5rem 0;
}

.board-view-page {
    background-repeat: no-repeat;
    background-size: cover;
    height: calc(100vh - 10px);

    &.main-content {
        min-height: unset;
    }

    .board-heading {
        padding: 10px;
        margin: 10px;
        border-radius: var(--el-border-radius-base);
        border: 1px solid var(--el-border-color);
    }
}
</style>
