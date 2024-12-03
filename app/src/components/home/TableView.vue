<template>
    <pw-view-page :full-width-page="true">
        <template #heading>
            <entry-heading class="board-heading" :display-delete-button="true" :display-edit-button="false" :display-view-markdown-button="false">
                <template #title-extras>
                    <el-tag><pm-icon icon="table"></pm-icon></el-tag>
                </template>
            </entry-heading>
        </template>
        <template #content>
            <TableDisplay :table="table"></TableDisplay>
        </template>
    </pw-view-page>
</template>

<script lang="ts" setup>
import EntryHeading from "@/src/components/home/entry-heading.vue";
import { useWikiStore } from '@/src/stores/wiki';
import { ref } from "vue";
import { readTable, Table } from '@/src/helpers/htmlTableData';
import TableDisplay from '@/src/components/home/basic-html-components/table.vue';

const wikiStore = useWikiStore();

const table = wikiStore.safeCurrentEntry.content;
</script>
