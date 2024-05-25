<template>
    <view-page>
        <template #heading>
            <entry-heading>
                <template #title-extras>
                    <el-tag type="danger"><pm-icon icon="file-pdf"></pm-icon></el-tag>
                </template>
            </entry-heading>
        </template>
        <template #content>
        <div ref="pdfContainer">
            <canvas v-for="n in totalPages" :key="n" :ref="'pdfCanvas' + n"></canvas>
        </div>
        </template>
    </view-page>
</template>

<script lang="ts">
import {defineComponent, toRaw} from "vue";
import * as pdfjslib from "pdfjs-dist";
import {useLoadingStore} from "pixlcms-wrapper";
import ViewPage from "@/src/components/pw/view-page.vue";
import EntryHeading from "@/src/components/home/entry-heading.vue";

pdfjslib.GlobalWorkerOptions.workerSrc = 'https://jslib.pixlmint.ch/pdfjs-dist/3.11.174/pdf.worker.min.js';

export default defineComponent({
    name: 'PDFContent',
    components: {EntryHeading, ViewPage},
    props: ['b64pdf'],
    data() {
        return {
            pdf: null as null | pdfjslib.PDFDocumentProxy,
            loader: useLoadingStore(),
            loadingIntervalMs: 100,
            loadingIntervalId: null as null | number,
            totalPages: 0,
            renderedPages: 0,
        };
    },
    mounted: function () {
        this.loadPdf(this.b64pdf);
        document.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount: function () {
        document.removeEventListener('scroll', this.handleScroll);
    },
    watch: {
        b64pdf(newVal) {
            this.loadPdf(newVal);
        }
    },
    methods: {
        loadPdf(b64pdf: string) {
            if (this.pdf) {
                const rawPdf = toRaw(this.pdf);
                rawPdf.destroy();
                this.pdf = null;
            }
            // Decode the new PDF
            const pdfData = atob(b64pdf);
            const uint8Array = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) {
                uint8Array[i] = pdfData.charCodeAt(i);
            }

            // Load the new PDF
            this.loader.increaseLoadingCount();
            this.loader.increaseLoadingTime(5000);
            window.setInterval(this.updateLoadingTime, this.loadingIntervalMs);
            const loadingTask = pdfjslib.getDocument({data: uint8Array});
            loadingTask.promise.then((pdf: pdfjslib.PDFDocumentProxy) => {
                this.pdf = pdf;
                this.totalPages = pdf.numPages;
                if (this.totalPages > 10) {
                    this.renderNextBatch(1, 10);
                } else {
                    this.renderNextBatch(1, this.totalPages);
                }
            });
        },
        updateLoadingTime() {
            this.loader.increaseTimePassed(this.loadingIntervalMs);
        },
        clearLoadingInterval() {
            this.loader.decreaseLoadingCount();
            if (this.loader.loadingCount < 1) {
                this.loader.resetLoadingBar();
            }
            if (this.loadingIntervalId === null) {
                return;
            }
            window.clearInterval(this.loadingIntervalId);
        },
        renderNextBatch(start: number, end: number) {
            for (let i = start; i <= end; i++) {
                this.renderPage(i);
            }
            this.renderedPages = end;
            this.clearLoadingInterval();
        },
        renderPage(pageNumber: number) {
            this.$nextTick(() => {
                if (this.pdf === null) {
                    return;
                }
                const rawPdf = toRaw(this.pdf);
                rawPdf.getPage(pageNumber).then((page: any) => {
                    const scale = 1.5;
                    const viewport = page.getViewport({scale});

                    // Prepare canvas using PDF page dimensions
                    const canvasElement = this.$refs["pdfCanvas" + pageNumber][0];
                    if (canvasElement instanceof HTMLCanvasElement) {
                        const canvas = canvasElement;
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        // Render PDF page into canvas context
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                        };
                        page.render(renderContext);
                    } else {
                        console.warn("Element is not a canvas");
                    }
                });
            });
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
});
</script>
