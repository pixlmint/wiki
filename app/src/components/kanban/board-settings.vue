<pm-dialog title="Board Settings" :route="route">
    <el-form @submit="killSubmit" :model="settings">
        <el-form-item label="Background">
            <el-upload :on-success="onSuccessUploading" action="/api/admin/gallery/upload" :headers="uploadHeaders"
                :data="{gallery: currentBoardId}" accept="image/*" v-model:file-list="settings.background">
                <template>
                    <el-button type="primary">
                        <pm-icon icon="upload" class="me-2"></pm-icon>
                        Click to Upload
                    </el-button>
                </template>
                <template #tip>
                    jpg/png files
                </template>
            </el-upload>
        </el-form-item>

        <el-form-item label="Labels">
            <labels-editor @change="updateLabels" :labels="boardLabels"></labels-editor>
            <el-button v-if="settings.labelsChanged" @click="saveLabels"><pm-icon icon="save"></pm-icon></el-button>
        </el-form-item>
    </el-form>
</pm-dialog>

<script lang="ts" setup>
import {reactive, computed} from "vue";
import {useBoardStore} from "@/stores/board";
import {useAuthStore} from "pixlcms-wrapper";
import {UploadFile, UploadFiles} from "element-plus";
import {CardLabel} from "@/contracts/Kanban";
import LabelsEditor from "@/components/kanban/labels-editor.vue";

interface UploadFileResponse {
    message: string,
    files: {
        path: string,
        scaled: { 100: string, 500: string, 1080: string, default: string },
    }[]
}

const boardStore = useBoardStore();
const authStore = useAuthStore();

const settings = reactive({
    background: [],
    labelsChanged: false,
});

const currentBoardId = computed(() => {
    return boardStore.safeCurrentBoard.id;
});

const boardLabels = computed(() => {
    const labels = boardStore.safeCurrentBoard.meta.board.labels;
    if (typeof labels === 'undefined') {
        return [];
    }
    return labels;
});

const uploadHeaders = computed(() => {
    return {pixltoken: authStore.token};
});

const updateMetaValue = function (key: string, value: any) {
    const meta = boardStore.safeCurrentBoard.meta;
    // @ts-ignore
    meta.board[key] = value;
    return meta;
}

const updateLabels = function (labels: CardLabel[]) {
    boardStore.safeCurrentBoard.meta.board.labels = labels;
    settings.labelsChanged = true;
}

const killSubmit = function (event: SubmitEvent) {
    event.preventDefault();
}

const saveLabels = function () {
    boardStore.updateBoardMeta(boardStore.safeCurrentBoard.meta);
}

const onSuccessUploading = function (response: UploadFileResponse, uploadFile: UploadFile, uploadFiles: UploadFiles) {
    const backgroundPath = response.files[0].path;
    boardStore.updateBoardMeta(updateMetaValue('background', backgroundPath));
}
</script>

<script lang="ts">
import {defineComponent} from "vue";

export const route = "/board/settings";

export default defineComponent({
    name: 'BoardSettings',
});
</script>
