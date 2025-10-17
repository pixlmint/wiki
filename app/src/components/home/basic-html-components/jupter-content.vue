<template>
    <pw-view-page>
        <template #heading>
            <entry-heading>
                <template #title-extras>
                    <el-tag><img width="12" heigth="12" :src="JupyterIcon"></el-tag>
                </template>
                <template #actions-extra>
                    <el-dropdown-item @click="dumpJupyter" title="Jupyter">
                        <pm-icon icon="file-arrow-down" />
                        <span>Dump Jupyter NB</span>
                    </el-dropdown-item>
                </template>
            </entry-heading>
        </template>
        <template #content>
            <ActualHtmlContent :content="props.content"></ActualHtmlContent>
        </template>
    </pw-view-page>
</template>

<script lang="ts" setup>
import EntryHeading from "@/src/components/home/entry-heading.vue";
import ActualHtmlContent from "@/src/components/home/basic-html-components/actual-html-content.vue";
import { useWikiStore } from '@/src/stores/wiki';
import { ElMessage } from "element-plus";
import JupyterIcon from "@/icon/jupyter.svg";

const wikiStore = useWikiStore();

const props = defineProps({
    content: {
        type: String,
        required: true,
    },
});

const dumpJupyter = function () {
    wikiStore.dumpAlternateContent(wikiStore.safeCurrentEntry.id).then(response => {
        ElMessage({
            message: 'Success',
        });
        wikiStore.fetchEntry(wikiStore.safeCurrentEntry.id);
    });
}
</script>
