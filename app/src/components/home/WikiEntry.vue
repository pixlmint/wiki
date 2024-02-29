<template>
    <template v-if="isPdfContent">
        <PDFContent :b64pdf="content"></PDFContent>
    </template>
    <template v-else-if="isBoard">
        <BoardView :board-id="entryId"/>
    </template>
    <template v-else>
        <BasicHtmlEntry :content="content"></BasicHtmlEntry>
    </template>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useAuthStore} from "pixlcms-wrapper";
import PDFContent from "@/src/components/home/PDFContent.vue";
import BasicHtmlEntry from "@/src/components/home/BasicHtmlEntry.vue";
import BoardView from "@/src/components/home/BoardView.vue";

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
        entryId() {
            return this.wikiStore.safeCurrentEntry.id;
        },
    },
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