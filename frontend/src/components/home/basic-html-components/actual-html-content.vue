<template></template>

<script lang="ts">
import { h, onMounted, watchEffect, defineComponent, VNode } from "vue";
import Highlighting from "@/components/pw/highlighting.vue";
import BasicLink from "@/components/home/basic-html-components/basic-link.vue";
import Table from "@/components/home/basic-html-components/table-content.vue";
import Heading from "@/components/home/basic-html-components/heading.vue";
import Checkbox from "@/components/home/basic-html-components/checkbox.vue";
import { useAuthStore } from "pixlcms-wrapper";

export default defineComponent({
    props: {
        content: {
            type: String,
            required: true,
        },
        entryId: {
            type: String,
            required: true,
        },
    },
    setup(props: { content: string }) {
        const canEdit = useAuthStore().haveEditRights();
        const htmlToVue = (html: string) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const ret = walkNodes(doc.body);
            return ret;
        };

        const headingRegex = /h[1-6]/;

        const walkNodes = (node: Node): VNode | string => {
            if (node instanceof Text) {
                return node.textContent;
            }
            if (!(node instanceof Element)) {
                return "";
            }

            const children = Array.from(node.childNodes).map(walkNodes);

            if (
                node.tagName === "CODE" &&
                node.parentElement?.tagName === "PRE"
            ) {
                return h(Highlighting, {
                    content: node.textContent,
                    language: getLangFromClass(node.classList),
                });
            }
            let tagName = node.tagName.toLowerCase();
            if (tagName === "body") {
                tagName = "div";
            }
            const attrs: Record<string, string> = {};
            for (const attr of Array.from(node.attributes)) {
                attrs[attr.name] = attr.value;
            }

            if (tagName === "a") {
                return h(BasicLink, { attrs: attrs, content: children[0] });
            }
            if (tagName === "table") {
                return h(Table, { table: node.outerHTML });
            }

            if (tagName === "input") {
                const isChecked =
                    typeof attrs.checked === "undefined" ||
                    attrs.checked === "false"
                        ? false
                        : true;
                return h(Checkbox, {
                    disabled: !canEdit,
                    checkboxId: parseInt(attrs["data-checkbox-index"]),
                    checked: isChecked,
                });
            }

            if (headingRegex.test(tagName)) {
                return h(Heading, {
                    tag: tagName,
                    value: (node as HTMLElement).innerText,
                    id: node.id,
                });
            }
            return h(tagName, attrs, children);
        };

        const getLangFromClass = (
            classList: string[] | DOMTokenList,
        ): string => {
            for (let i = 0; i < classList.length; i++) {
                if (classList[i].startsWith("language")) {
                    return classList[i].split("-")[1];
                }
            }

            return "txt";
        };

        const renderComponent = () => {
            return htmlToVue(props.content);
        };

        onMounted(renderComponent);
        watchEffect(renderComponent);

        return renderComponent;
    },
});
</script>
