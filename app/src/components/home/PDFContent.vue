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
                <!-- <canvas v-for="n in totalPages" :key="n" :ref="'pdfCanvas' + n"></canvas> -->
                <div v-for="page in pages" :key="page">
                    <VuePDF :pdf="pdf" :page="page" text-layer fit-parent />
                </div>
        </div>
        </template>
    </view-page>
</template>

<script lang="ts" setup>
import ViewPage from "@/components/pw/view-page.vue";
import EntryHeading from "@/components/home/entry-heading.vue";
import { VuePDF, usePDF } from "@tato30/vue-pdf";


const props = defineProps(['pdfPath']);


const {pdf, pages, info} = usePDF(props.pdfPath);
</script>
