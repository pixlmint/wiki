<template>
    <pw-view-page :full-width-page="true">
        <template #heading>
            <entry-heading :display-delete-button="true" :display-edit-button="false" :display-view-markdown-button="false">
                <template #title-extras>
                    <el-tag><pm-icon icon="trello" package="brands"></pm-icon></el-tag>
                </template>
            </entry-heading>
        </template>
        <template #content>
            <board :board-id="boardId"></board>
        </template>
    </pw-view-page>
</template>

<script lang="ts">
import board from '@/src/components/kanban/board.vue';
import {defineComponent} from "vue";
import EntryHeading from "@/src/components/home/entry-heading.vue";
import PmIcon from "pixlcms-wrapper/src/components/icon.vue";

export default defineComponent({
    name: "BoardView",
    components: {
        PmIcon,
        EntryHeading,
        board,
    },
    props: ['boardId'],
});
</script>