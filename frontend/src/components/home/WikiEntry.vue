<template>
    <template v-if="isPdfContent">
        <PDFContent :pdfPath="pdfPath"></PDFContent>
    </template>
    <template v-else-if="isBoard">
        <pw-view-page :full-width-page="true">
            <template #content>
                A kanban board should be showing here, but those are broken and
                no longer supported.
            </template>
        </pw-view-page>
    </template>
    <template v-else-if="isTable">
        <TableView></TableView>
    </template>
    <template v-else-if="isJupyterNotebook">
        <JupyterContent :content="content" />
    </template>
    <template v-else>
        <BasicHtmlEntry :content="content" :entry-id="entryId"></BasicHtmlEntry>
    </template>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useWikiStore } from "@/stores/wiki";
import { useAuthStore } from "pixlcms-wrapper";
import PDFContent from "@/components/home/PDFContent.vue";
import BasicHtmlEntry from "@/components/home/basic-html-components/BasicHtmlEntry.vue";
const TableView = defineAsyncComponent(
    () => import("@/components/home/TableView.vue"),
);
const JupyterContent = defineAsyncComponent(
    () => import("@/components/home/basic-html-components/jupter-content.vue"),
);
import { queryFormatter } from "pixlcms-wrapper/src/helpers/utils";

const wikiStore = useWikiStore();
const authStore = useAuthStore();

const content = computed(() => {
    window.setTimeout(() => {
        MathJax.typeset();
    }, 50);
    return wikiStore.safeCurrentEntry.content;
});

const isPdfContent = computed(() => {
    if (!("renderer" in wikiStore.safeCurrentEntry.meta)) {
        return false;
    }
    return "pdf" === wikiStore.safeCurrentEntry.meta.renderer;
});

const isJupyterNotebook = computed(() => {
    if (!("renderer" in wikiStore.safeCurrentEntry.meta)) {
        return false;
    }
    return "ipynb" === wikiStore.safeCurrentEntry.meta.renderer;
});

const isTable = computed(() => {
    const content = wikiStore.safeCurrentEntry;
    const html = document.createElement("html");
    html.innerHTML = content.content;
    const body = html.children[1];

    return (
        body.childNodes.length === 1 && body.childNodes[0].nodeName === "TABLE"
    );
});

const isBoard = computed(() => {
    return "board" === wikiStore.safeCurrentEntry.meta.kind;
});

const entryId = computed(() => wikiStore.safeCurrentEntry.id);

const pdfPath = computed(() => {
    const base = "/api/entry/load-pdf?";
    const data = { p: entryId, pixltoken: authStore.token };
    return base + queryFormatter(data);
});
</script>

<style lang="scss">
@use "@/style/variables.scss";

.article-body {
    margin: 5px;
}

h1 {
    margin-top: 0.5rem;
}

h2,
h3,
h4,
h5,
h6 {
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
