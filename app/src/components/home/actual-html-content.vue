<template></template>

<script lang="ts">
import {h, onMounted, watchEffect, defineComponent} from "vue";
import Highlighting from "@/src/components/pw/highlighting.vue";

export default defineComponent({
    props: {
        content: {
            type: String,
            required: true,
        },
    },
    setup(props: {content: string}) {
        const htmlToVue = (html: string) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const ret = walkNodes(doc.body);
            return ret;
        };

        const walkNodes = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const children = Array.from(node.childNodes).map(child => walkNodes(child));
                if (node.tagName === 'CODE' && node.parentNode && node.parentNode.tagName === 'PRE') {
                    console.log(node.textContent);
                    return h(Highlighting, {
                        content: node.textContent,
                        language: getLangFromClass(node.classList),
                    });
                }
                let tagName= node.tagName.toLowerCase();
                if (tagName === 'body') {
                    tagName = 'div';
                }
                return h(tagName, children);
            }
        };

        const getLangFromClass = (classList: string[]) => {
            for (let i = 0; i < classList.length; i++) {
                if (classList[i].startsWith('language')) {
                    return classList[i].split('-')[1];
                }
            }

            return null;
        }

        const renderComponent = () => {
            return htmlToVue(props.content);
        };

        onMounted(renderComponent);
        watchEffect(renderComponent);

        return renderComponent;
    }
});
</script>
