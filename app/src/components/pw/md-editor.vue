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

const {modelValue} = defineProps<{
    modelValue: string;
}>();
const emit = defineEmits();

const editor = ref(null);

const userSettingsStore = useUserSettings();

onMounted(() => {
    const e = new Editor({
        el: editor.value,
        height: window.innerHeight - 200 + 'px',
        initialEditType: 'markdown',
        previewStyle: 'tab',
        hideModeSwitch: true,
        usageStatistics: false,
        theme: userSettingsStore.settings.theme,
        useCommandShortcut: false,
        events: {
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
        emit('save', e.getMarkdown());  // Emit a custom "save" event with the current Markdown content
        return true;
    });
    if (modelValue) {
        e.setMarkdown(modelValue);
    }
    window.addEventListener('resize', (event) => {
        console.log(window.innerWidth);
    })
});
</script>