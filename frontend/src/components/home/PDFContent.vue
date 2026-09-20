<template>
  <view-page>
    <template #heading>
      <entry-heading
        :display-view-markdown-button="false"
        :display-media-buttons="false"
      >
        <template #title-extras>
          <el-tag type="danger"><pm-icon icon="file-pdf"></pm-icon></el-tag>
        </template>
      </entry-heading>
    </template>
    <template #content>
      <div ref="pdfContainer">
        <object
          class="pdf-container"
          :data="props.pdfPath"
          type="application/pdf"
          width="100%"
        />
      </div>
    </template>
  </view-page>
</template>

<script lang="ts" setup>
import ViewPage from "@/components/pw/view-page.vue";
import EntryHeading from "@/components/home/entry-heading.vue";

const props = defineProps(["pdfPath"]);
</script>

<style lang="scss" scoped>
.pdf-container {
  height: calc(100vh - 2.5rem - 1rem - 50px);
}
</style>
