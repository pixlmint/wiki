<template>
    <pm-dialog @close="handleClose" :route="route" :title="dialogTitle">
        <el-form>
            <el-form-item label="Labels">
                <div class="d-flex gap-1">
                    <el-select @change="settings.labelsChanged = true" v-model="selectedLabels" multiple
                               placeholder="Select Labels">
                        <el-option v-for="(label) in labels" :key="label.title" :label="label.title"
                                   :value="label.title"/>
                    </el-select>
                    <el-button @click="saveSelectedLabels" v-show="settings.labelsChanged">
                        <pm-icon icon="save"></pm-icon>
                    </el-button>
                </div>
            </el-form-item>
        </el-form>
    </pm-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export const route = "/board/card/view";

export default defineComponent({
    name: 'CardModal',
})
</script>

<script setup lang="ts">
import {computed, ref, reactive, toRaw} from "vue";
import {buildRequest, send, useDialogStore} from "pixlcms-wrapper";
import {useBoardStore} from "@/src/stores/board";
import {useWikiStore} from "@/src/stores/wiki";
import {DateTime} from "luxon";
import {BoardResponse, CardLabel} from "@/src/contracts/Kanban";

const dialogStore = useDialogStore();
const boardStore = useBoardStore();
const wikiStore = useWikiStore();

const data = reactive({
    viewingCard: null as null | BoardResponse,
});

const request = buildRequest('/api/entry/view', {p: dialogStore.getDialogData(route).id});
send(request).then(response => {
    data.viewingCard = response.data;
});

const settings = reactive({
    labelsChanged: false,
});

const selectedLabels = ref([]);

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

const saveSelectedLabels = function () {
    const now = DateTime.now();
    // @ts-ignore
    const newMeta = toRaw(data.viewingCard.meta);
    if (!('card' in newMeta)) {
        // @ts-ignore
        newMeta['card'] = {labels: []};
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

    console.log(requestData);

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
    if (typeof viewingCard.value.meta.card !== 'undefined') {
        selectedLabels.value = viewingCard.value.meta.card.labels.map((label: CardLabel) => {
            return label.title;
        });
    }
}, 50);
</script>