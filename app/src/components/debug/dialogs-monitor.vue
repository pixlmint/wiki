<template>
    <div>
        <ul>
            <li>
                Dialogs Count: {{ dialogsCount }}
            </li>
            <li v-for="dialog in showingDialogs">
                {{ dialog }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useDialogStore} from "pixlcms-wrapper";

export default defineComponent({
    name: "DialogsMonitor",
    data() {
        return {
            dialogStore: useDialogStore(),
        }
    },
    computed: {
        dialogsCount: function () {
            return this.dialogStore.getShowingDialogs.dialogs.length;
        },
        showingDialogs: function () {
            return this.dialogStore.getShowingDialogs.dialogs;
        }
    },
})
</script>
