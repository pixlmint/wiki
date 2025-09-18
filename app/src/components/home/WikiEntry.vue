<template>
    <template v-if="isPdfContent">
        <PDFContent :pdfPath="pdfPath"></PDFContent>
    </template>
    <template v-else-if="isBoard">
        <BoardView :board-id="entryId"/>
    </template>
    <template v-else-if="isTable">
        <TableView></TableView>
    </template>
    <template v-else-if="isJupyterNotebook">
        <JupyterContent :content="content" />
    </template>
    <template v-else>
        <el-button style="z-index: 100; position: absolute; top: 20px; left: 100px;" @click="showLastChanged">Show last changed</el-button>
        <BasicHtmlEntry :content="content"></BasicHtmlEntry>
    </template>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useAuthStore} from "pixlcms-wrapper";
import PDFContent from "@/src/components/home/PDFContent.vue";
import BasicHtmlEntry from "@/src/components/home/basic-html-components/BasicHtmlEntry.vue";
import BoardView from "@/src/components/home/BoardView.vue";
import TableView from "@/src/components/home/TableView.vue";
import JupyterContent from "@/src/components/home/basic-html-components/jupter-content.vue";
import { queryFormatter } from "pixlcms-wrapper/src/helpers/utils";
import ExcalidrawWrapper from "@/src/components/drawing/excalidraw.vue";

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
        JupyterContent,
    },
    computed: {
        content() {
            window.setTimeout(() => {
                if (typeof MathJax !== 'undefined') {
                    MathJax.typeset();
                }
            }, 50);
            return this.wikiStore.currentEntry!.content;
        },
        isPdfContent() {
            if (!('renderer' in this.wikiStore.currentEntry!.meta)) {
                return false;
            }
            return 'pdf' === this.wikiStore.currentEntry!.meta.renderer;
        },
        isJupyterNotebook() {
            if (!('renderer' in this.wikiStore.currentEntry!.meta)) {
                return false;
            }
            return 'ipynb' === this.wikiStore.currentEntry!.meta.renderer;
        },
        isBoard() {
            return 'board' === this.wikiStore.currentEntry!.meta.kind;
        },
        isTable() {
            const content = this.wikiStore.currentEntry!;
            const html = document.createElement('html');
            html.innerHTML = content.content;
            const body = html.children[1];

            return body.childNodes.length === 1 && body.childNodes[0].nodeName === 'TABLE';
        },
        entryId() {
            return this.wikiStore.currentEntry!.id;
        },
        pdfPath() {
            const base = '/api/entry/load-pdf?';
            const data = {p: this.entryId, pixltoken: this.authStore.token};
            return base + queryFormatter(data);
        },
    },
    methods: {
        showLastChanged() {
            this.wikiStore.fetchLastChanged(this.wikiStore.currentEntry.id).then(lastChanged => {
                console.log(lastChanged);
            });
        }
    }
})
</script>

<style lang="scss">
@import '../../../style/variables.scss';

.article-body {
    margin: 5px;
}

h1 {
    margin-top: 0.5rem;
}

h2, h3, h4, h5, h6 {
    border-bottom: 1px solid var(--el-border-color);
}

/*.mobile-action-buttons {
    display: block !important;
}

.desktop-action-buttons {
    display: none;
}*/

/*@media screen and (min-width: $mobileBreakpoint) {
    .mobile-action-buttons {
        display: none !important;
    }

    .desktop-action-buttons {
        display: block;
    }
}*/
</style>
