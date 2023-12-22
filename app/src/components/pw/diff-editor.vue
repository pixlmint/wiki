<template>
    <div>
        <Diff mode="split" theme="light" :prev="originalText" :current="modifiedText"/>
        <pw-md-editor v-model="finalText"></pw-md-editor>
        <el-button type="primary" @click="submitMerge">Merge</el-button>
    </div>
</template>

<script setup lang="ts">
import {defineEmits, onMounted, ref, watch} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import 'vue-diff/dist/index.css';

const wikiStore = useWikiStore();
const finalText = ref('');

const props = defineProps(["originalText", "modifiedText"]);

const emit = defineEmits({
    submitMerge: null,
});

const submitMerge = () => {
    emit('submitMerge', finalText.value);
}

watch(() => props.modifiedText, (newVal) => {
    finalText.value = newVal;
}, { immediate: true });

onMounted(() => {
    finalText.value = props.modifiedText;
});
</script>
