<template>
  <div>
    <div ref="editor"/>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import Editor, {EditorType} from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const {modelValue} = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits();

const editor = ref(null);

onMounted(() => {
  const e = new Editor({
    el: editor.value,
    height: window.innerHeight - 200 + 'px',
    initialEditType: 'markdown',
    previewStyle: 'tab',
    hideModeSwitch: true,
    usageStatistics: false,
    useCommandShortcut: false,
    events: {
      change: () => {
        emit('update:modelValue', e.getMarkdown());
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
});
</script>

<style lang="scss">
.ProseMirror {
  background-color: transparent !important;
  color: var(--el-text-color) !important;
}
</style>