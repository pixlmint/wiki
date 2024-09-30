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

<style lang="scss">
::root {
    --pw-code-bg: rgba(238, 221, 251, 0.2);
}
html.light {
    @import 'prism-themes/themes/prism-vs';
    --pw-code-bg: rgba(238, 221, 251, 0.2);
}

html.dark {
    @import 'prism-themes/themes/prism-atom-dark';
    --pw-code-bg: rgba(67, 58, 102, 0.25);
}

pre, li > code, p > code, h1 > code, h2 > code, h3 > code, h4 > code, h5 > code {
    background-color: var(--pw-code-bg);
    border: 1px solid rgba(99, 99, 99, 0.1);
    overflow-x: auto;
}

pre {
    padding: 0.5rem 1rem;
    border-radius: 5px;
}

[class*='language-'] {
    font-family: unset !important;
}
</style>
