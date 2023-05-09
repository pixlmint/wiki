<template>
    <div>
        <div class="container">
            <v-md-editor @change="updateContent" @save="save" v-model="markdown" :height="wHeight + 'px'"></v-md-editor>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, toRaw} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useAuthStore} from '@/src/stores/auth'
import {useRouter} from 'vue-router'
import {useMainStore} from "@/src/stores/main";

export default defineComponent({
    data: function () {
        return {
            mainStore: useMainStore(),
            wikiStore: useWikiStore(),
        }
    },
    computed: {
        markdown() {
            if (this.wikiStore.currentEntry === null) {
                return '';
            }
            return this.wikiStore.currentEntry.raw_content;
        },
        wHeight() {
            return window.innerHeight - 150;
        },
    },
    methods: {
        updateContent() {
            if (!this.wikiStore.currentEntry) {
                console.error('Not editing an entry');
                return '';
            }
            this.mainStore.setHasUnsavedChanges(true);
            const area = document.getElementsByTagName('textarea').item(0);
            if (area === null) {
                console.error('Unable to find the text area');
                return '';
            }
            this.wikiStore.currentEntry.raw_content = area.value;
        },
        save() {
            this.mainStore.setHasUnsavedChanges(false);
            return this.wikiStore.saveEntry(useAuthStore().token)
        },
        checkGoHome() {
            if (this.mainStore.editingUnsavedChanges && confirm('You\'ve go unsaved changes. Save first?')) {
                this.save().then(() => {
                    this.doGoHome();
                });
            } else {
                this.doGoHome();
            }
        },
        doGoHome() {
            useRouter().push('/');
        }
    },
})
</script>