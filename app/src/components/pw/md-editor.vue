<template>
    <div>
        <div class="md-editor" ref="editor"/>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import Editor, {EditorType} from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import {useUserSettings} from "@/src/stores/user-settings";

const {modelValue, editorHeight} = defineProps<{
    modelValue: string;
    editorHeight: string;
}>();
const emit = defineEmits();

const editor = ref(null);

const userSettingsStore = useUserSettings();

let e: any;

const createRefreshButton = () => {
    const button = document.createElement('button');

    button.className = 'toastui-editor-toolbar-icons last';
    button.style.backgroundImage = 'none';
    button.style.margin = '0';
    button.innerHTML = `<span>Reload</span>`;
    button.addEventListener('click', () => {
        e.exec('refresh');
    });

    return button;
};

onMounted(() => {
    e = new Editor({
        // @ts-ignore
        el: editor.value,
        height: editorHeight,
        initialEditType: 'markdown',
        previewStyle: 'tab',
        hideModeSwitch: true,
        usageStatistics: false,
        theme: userSettingsStore.settings.theme,
        useCommandShortcut: false,
        toolbarItems: [
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task'],
            ['code', 'codeblock'],
            [
                {
                    el: createRefreshButton(),
                    name: 'refresh',
                    command: 'refresh',
                    tooltip: 'Refresh',
                },
            ]
        ],
        events: {
            beforePreviewRender: (html: string) => {
                window.setTimeout(() => {
                    // @ts-ignore
                    MathJax.typeset()
                }, 20);
                return html;
            },
            change: () => {
                emit('update:modelValue', e.getMarkdown());
            },
            keyup: () => {
                emit('input', e.getMarkdown());
            },
            keydown: (type: EditorType, event: KeyboardEvent) => {
                if (event.ctrlKey && event.code === 'KeyS') {
                    event.preventDefault();
                    emit('save', e.getMarkdown());
                }
            },
        },
    });
    e.addCommand('markdown', 'ctrl+s', () => {
        emit('save', e.getMarkdown());
        return true;
    });
    e.addCommand('markdown', 'refresh', () => {
        emit('refresh');
        // TODO: I have to press refresh twice to actually trigger a refresh
        return true;
    });
    if (modelValue) {
        e.setMarkdown(modelValue);
    }
    window.addEventListener('resize', (event) => {
    })
});
</script>
