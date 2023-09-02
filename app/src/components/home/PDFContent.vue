<template>
    <div>
        <div ref="pdfContainer" @scroll="handleScroll">
            <canvas v-for="n in totalPages" :key="n" :ref="'pdfCanvas' + n"></canvas>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, toRaw} from "vue";
import * as pdfjslib from "pdfjs-dist";

pdfjslib.GlobalWorkerOptions.workerSrc = 'https://jslib.pixlmint.ch/pdf.worker.min.js';

export default defineComponent({
    name: 'PDFContent',
    props: ['b64pdf'],
    data() {
        return {
            pdf: null as null | pdfjslib.PDFDocumentProxy,
            totalPages: 0,
            renderedPages: 0,
        };
    },
    mounted: function () {
        const pdfData = atob(this.b64pdf);
        const uint8Array = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
            uint8Array[i] = pdfData.charCodeAt(i);
        }

        const loadingTask = pdfjslib.getDocument({data: uint8Array});
        loadingTask.promise.then((pdf: pdfjslib.PDFDocumentProxy) => {
            this.pdf = pdf;
            this.totalPages = pdf.numPages;
            if (this.totalPages > 10) {
                this.renderNextBatch(1, 10);
            } else {
                this.renderNextBatch(1, this.totalPages);
            }
        })
    },
    methods: {
        renderNextBatch(start: number, end: number) {
            for (let i = start; i <= end; i++) {
                this.renderPage(i);
            }
            this.renderedPages = end;
        },
        renderPage(pageNumber: number) {
            this.$nextTick(() => {
                if (this.pdf === null) {
                    return;
                }
                const rawPdf = toRaw(this.pdf);
                console.log("Calling getPage on: ", rawPdf);
                rawPdf.getPage(pageNumber).then((page: any) => {
                    const scale = 1.5;
                    const viewport = page.getViewport({scale});

                    // Prepare canvas using PDF page dimensions
                    const canvas = this.$refs["pdfCanvas" + pageNumber][0];
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into canvas context
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    page.render(renderContext);
                });
            })
        },
        handleScroll() {
            const container = this.$refs.pdfContainer as HTMLElement;
            if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
                if (this.renderedPages < this.totalPages) {
                    const startPage = this.renderedPages + 1;
                    const endPage = Math.min(this.totalPages, this.renderedPages + 5);
                    this.renderNextBatch(startPage, endPage);
                }
            }
        },
    },
})
</script>