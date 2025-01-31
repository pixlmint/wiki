<template>
    <div>
        <div class="md-editor" ref="editor"/>
        <div class="toolbar-icons">
            <div v-for="icon in toolbarIcons" class="toolbar-icon" :id="'tui_icons_' + icon" :key="icon">
                <pm-icon class="pw-icon-in-tui-toolbar" :icon="icon"></pm-icon>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import Editor, {EditorType} from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import {useUserSettings} from "@/src/stores/user-settings";
import { useDialogStore } from 'pixlcms-wrapper';

const {modelValue, editorHeight} = defineProps<{
    modelValue: string;
    editorHeight: string;
}>();
const emit = defineEmits();

const editor = ref(null);

const userSettingsStore = useUserSettings();

let e: any;

const toolbarIcons = ref(<string[]>[
    'pen-ruler',
    'rotate',
    'table',
    'save',
]);

const dialogStore = useDialogStore();

const createToolbarButton = function (icon: string, onClick: () => any) {
    const button = document.createElement('button');
    const iconEl = document.getElementById('tui_icons_' + icon);
    let btnContent = "";

    if (iconEl === null) {
        btnContent = "X"; 
    } else {
        btnContent = iconEl.innerHTML;
    }

    button.className = 'toastui-editor-toolbar-icons last';
    button.style.backgroundImage = 'none';
    button.style.margin = '0';
    button.innerHTML = btnContent;
    button.addEventListener('click', onClick);

    return button;
}

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
            [
                {
                    el: createToolbarButton('table', () => {
                        dialogStore.showDialog({
                            route: '/table-editor',
                            closeCallback: () => {
                                emit('refresh');
                            },
                        });
                    }),
                    name: 'table',
                    command: 'table',
                    tooltip: 'Table',
                },
                {
                    el: createToolbarButton('pen-ruler', () => {
                        dialogStore.showDialog('/draw');
                    }),
                    name: 'draw',
                    command: 'draw',
                    tooltip: 'Draw',
                },
            ],
            ['quote', 'ol', 'task', 'codeblock'],
            [
                {
                    el: createToolbarButton('save', () => {
                        e.exec('save');
                    }),
                    name: 'save',
                    command: 'save',
                    tooltip: 'Save',
                },
                {
                    el: createToolbarButton('rotate', () => {
                        emit('save', e.getMarkdown());
                    }),
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
    window.addEventListener('resize', () => {
    })
});
</script>

<style lang="scss" scoped>
.toolbar-icons {
    display: none;
}

.pw-icon-in-tui-toolbar {
    color: var(--el-text-color);
}
</style>
