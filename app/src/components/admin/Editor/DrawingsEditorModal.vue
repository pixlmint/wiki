<template>
    <el-dialog v-model="isShowing">

    </el-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useDialogStore} from "@/src/stores/dialog";
import {useWikiStore} from "@/src/stores/wiki";

const route = '/drawings';

export default defineComponent({
    name: 'DrawingsEditorModal',
    data() {
        return {
            dialogStore: useDialogStore(),
            wikiStore: useWikiStore(),
        }
    },
    created() {

    },
    computed: {
        isShowing: {
            get() {
                return route === this.dialogStore.getShowingDialog;
            },
            set() {
                this.dialogStore.clearShowingDialog();
            }
        }
    }
})
</script>