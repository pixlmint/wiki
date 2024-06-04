<template>
    <code :class="'language-' + data.lang" v-html="data.code"></code>
</template>

<script lang="ts" setup>
import { defineProps, reactive, onMounted} from 'vue';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';

const props = defineProps({
    content: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: '',
    },
});

const data = reactive({
    code: '',
    lang: '',
});

onMounted(() => {
    if (!props.language) {
        data.code = Prism.highlight(props.content, Prism.languages['txt'], '');
        data.lang = 'txt';
    } else {
        data.code = Prism.highlight(props.content, Prism.languages[props.language], props.language);
        data.lang = props.language;
    }
});
</script>
