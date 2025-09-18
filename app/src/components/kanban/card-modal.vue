<template>
    <pm-dialog @close="handleClose" :route="route" :title="dialogTitle">
        <el-form>
            <el-form-item label="Labels">
                <div class="d-flex gap-1">
                    <el-select @change="settings.labelsChanged = true" v-model="selectedLabels" multiple
                        placeholder="Select Labels">
                        <el-option v-for="(label) in labels" :key="label.title" :label="label.title"
                            :value="label.title" />
                    </el-select>
                    <el-button @click="saveSelectedLabels" v-show="settings.labelsChanged">
                        <pm-icon icon="save"></pm-icon>
                    </el-button>
                    <pw-md-editor editorHeight="500px" v-if="settings.contentLoaded" @input="updateContent"
                        @save="saveCardMdContent" v-model="cardMdContent"></pw-md-editor>
                </div>
            </el-form-item>
        </el-form>
    </pm-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserSettings } from "@/src/stores/user-settings";
import { ElNotification } from "element-plus";
import wikiServiceManager from "@/src/services/wikiExtension";

export const route = "/board/card/view";

export default defineComponent({
    name: 'CardModal',
})
</script>

<script setup lang="ts">
import { computed, ref, reactive, toRaw } from "vue";
import { buildRequest, send, useDialogStore } from "pixlcms-wrapper";
import { useBoardStore } from "@/src/stores/board";
import { useWikiStore } from "@/src/stores/wiki";
import { DateTime } from "luxon";
import { BoardResponse, CardLabel } from "@/src/contracts/Kanban";

const dialogStore = useDialogStore();
const boardStore = useBoardStore();
const wikiStore = useWikiStore();
const userSettings = useUserSettings();

const service = wikiServiceManager.defaultInstance;

const data = reactive({
    viewingCard: null as null | BoardResponse,
});

service.cms.fetchEntry(dialogStore.getDialogData(route).id).then(entry => {
    data.viewingCard = entry;
    if (data.viewingCard !== null) {
        cardMdContent.value = data.viewingCard.raw_content;
        settings.contentLoaded = true;
    } else {
        console.error('data.viewingCard is null');
    }
})

const settings = reactive({
    labelsChanged: false,
    contentLoaded: false,
});

const selectedLabels = ref([]);
const cardMdContent = ref('');
let saveTimeout: null | number = null;

const isTimeoutSet = function () {
    return saveTimeout !== null;
}

const labels = computed(() => {
    return boardStore.safeCurrentBoard.meta.board.labels;
});

const viewingCard = computed(() => {
    return dialogStore.getDialogData(route)
});

const dialogTitle = computed(() => {
    return viewingCard.value.meta.title;
});

const getSelectedLabels = function () {
    return selectedLabels.value.map((labelName: string) => {
        return toRaw(boardStore.getCardLabel(labelName));
    });
}

const updateContent = function (md: string) {
    if (data.viewingCard === null) {
        return;
    }
    data.viewingCard.raw_content = md;
    if (userSettings.getSettings.autoSave && !isTimeoutSet()) {
        saveTimeout = window.setTimeout(() => {
            saveTimeout = null;
            saveCardMdContent();
        }, 5000);
    }
}

const saveCardMdContent = function () {
    if (data.viewingCard !== null) {
        if (isTimeoutSet()) {
            window.clearTimeout(saveTimeout);
        }
        wikiStore.saveEntry(data.viewingCard);
    } else {
        ElNotification({
            type: 'warning',
            title: 'Warning',
            message: 'Unable to save the entry',
        });
    }
}

const saveSelectedLabels = function () {
    const now = DateTime.now();
    // @ts-ignore
    const newMeta = toRaw(data.viewingCard.meta);
    if (!('card' in newMeta)) {
        // @ts-ignore
        newMeta['card'] = { labels: [] };
    }
    // @ts-ignore
    newMeta.card.labels = getSelectedLabels();
    const requestData = {
        meta: newMeta,
        // @ts-ignore
        entry: data.viewingCard.id,
        lastUpdate: now.toFormat('yyyy-MM-dd HH:mm:ss'),
        // @ts-ignore
        content: data.viewingCard.raw_content,
    }

    // @ts-ignore
    const request = buildRequest('/api/admin/entry/edit', requestData, 'PUT');
    send(request).then(() => {
        settings.labelsChanged = false;
    });
}

const handleClose = function () {
    boardStore.refreshBoard();
}

window.setTimeout(function () {
    cardMdContent.value = viewingCard.value.content;
    if (typeof viewingCard.value.meta.card !== 'undefined') {
        selectedLabels.value = viewingCard.value.meta.card.labels.map((label: CardLabel) => {
            return label.title;
        });
    }
}, 50);
</script>
