<template>
    <!--<template v-if="isPdfContent">
        <PDFContent :pdfPath="pdfPath"></PDFContent>
    </template>
    <template v-else-if="isBoard">
        <BoardView :board-id="entryId"/>
    </template>
    <template v-else-if="isTable">
        <TableView></TableView>
    </template>
    <template v-else>
        <!--<ExcalidrawWrapper width="1000" height="1000" />-->
        <!--<BasicHtmlEntry :content="content"></BasicHtmlEntry>
</template>-->
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/stores/wiki'
import {useAuthStore} from "pixlcms-wrapper";
import PDFContent from "@/components/home/PDFContent.vue";
import BasicHtmlEntry from "@/components/home/basic-html-components/BasicHtmlEntry.vue";
import BoardView from "@/components/home/BoardView.vue";
import TableView from "@/components/home/TableView.vue";
import { queryFormatter } from "pixlcms-wrapper/src/helpers/utils";
import ExcalidrawWrapper from "@/components/drawing/excalidraw.vue";

export default defineComponent({
    name: "WikiEntry",
    data: () => {
        return {
            wikiStore: useWikiStore(),
            authStore: useAuthStore(),
        }
    },
    components: {
        PDFContent,
        BoardView,
        BasicHtmlEntry,
        TableView,
        ExcalidrawWrapper,
    },
    computed: {
        content() {
            window.setTimeout(() => {
                MathJax.typeset();
            }, 50);
            return this.wikiStore.safeCurrentEntry.content;
        },
        isPdfContent() {
            if (!('renderer' in this.wikiStore.safeCurrentEntry.meta)) {
                return false;
            }
            return 'pdf' === this.wikiStore.safeCurrentEntry.meta.renderer;
        },
        isBoard() {
            return 'board' === this.wikiStore.safeCurrentEntry.meta.kind;
        },
        isTable() {
            const content = this.wikiStore.safeCurrentEntry;
            const html = document.createElement('html');
            html.innerHTML = content.content;
            const body = html.children[1];

            return body.childNodes.length === 1 && body.childNodes[0].nodeName === 'TABLE';
        },
        entryId() {
            return this.wikiStore.safeCurrentEntry.id;
        },
        pdfPath() {
            const base = '/api/entry/load-pdf?';
            const data = {p: this.entryId, pixltoken: this.authStore.token};
            return base + queryFormatter(data);
        },
    },
})
</script>

<style lang="scss">
@use '@style/variables';

.article-body {
    margin: 5px;
}

h1 {
    margin-top: 0.5rem;
}

h2, h3, h4, h5, h6 {
    border-bottom: 1px solid var(--el-border-color);
}

.mobile-action-buttons {
    display: block !important;
}

.desktop-action-buttons {
    display: none;
}

@media screen and (min-width: $mobileBreakpoint) {
    .mobile-action-buttons {
        display: none !important;
    }

    .desktop-action-buttons {
        display: block;
    }
}
</style>
