<template>
    <pm-dialog :route="route" :title="title">
        <template v-if="action === JupyterSetupAction.CreateNew">
            <alternative-content-upload-form v-if="data.ready" :isInitialUpload="true" @afterSave="closeDialog"
                :entryId="data.entryId" :formData="data.formData">
                <template #form-extra>
                    <el-collapse v-model="connectorSetupShowing">
                        <el-collapse-item title="Connector Configuration" :name="1">
                            <jupyter-setup @change="handleConnectorChange" @save="testAndStoreConnectorConfiugration" />
                        </el-collapse-item>
                    </el-collapse>
                </template>
            </alternative-content-upload-form>
        </template>
        <template v-else-if="action === JupyterSetupAction.FixConnectorConfiguration">
            <jupyter-setup @change="handleConnectorChange" @save="testAndStoreConnectorConfiugration" />
        </template>
        <template v-else>
            The Notebooks are out of sync, select an action to take
            <el-radio-group v-model="action">
                <el-radio :value="JupyterSetupAction.OverwriteRemote">Overwrite Remote</el-radio>
                <el-radio :value="JupyterSetupAction.OverwriteLocal">Overwrite Local</el-radio>
                <el-radio :value="JupyterSetupAction.OpenNotebook">Open</el-radio>
                <el-radio :value="JupyterSetupAction.UpdateConfiguration">Change Connector Configuration</el-radio>
            </el-radio-group>

            <el-button @click="cancel">Cancel</el-button>
            <el-button @click="confirm" v-if="!connectorSettingsChanged">Confirm</el-button>
            <el-button disabled @click="confirm" v-else>Confirm</el-button>
            <jupyter-setup @change="handleConnectorChange" @save="testAndStoreConnectorConfiugration" v-if="action === JupyterSetupAction.UpdateConfiguration" />
        </template>
    </pm-dialog>
</template>

<script lang="ts" setup>
import { useDialogStore } from 'pixlcms-wrapper';
import { JupyterConnectorSettings, JupyterSetupAction, useJupyterConnectionsStore } from '@/src/helpers/jupyter';
import { computed, onMounted, reactive, ref } from 'vue';
import { AlternativeContentForm } from '@/src/helpers/alternativeContentHelper';
import JupyterSetup from './jupyter-setup.vue';
import AlternativeContentUploadForm from "@/src/components/forms/alternative-content-upload-form.vue";

const action = ref(JupyterSetupAction.OpenNotebook);

const dialogStore = useDialogStore();
const dialogData = dialogStore.getDialogData(route);
const connectionsStore = useJupyterConnectionsStore();

const connectorSetupShowing = ref(0);

type SetupModalData = {
    formData: AlternativeContentForm | null;
    ready: boolean;
    entryId: string | null;
};

const data = reactive<SetupModalData>({
    formData: null,
    ready: false,
    entryId: null,
});

const connectorSettingsChanged = ref(false);

const title = computed(() => dialogData.title);

onMounted(() => {
    console.log(dialogData);
    if ('action' in dialogData) {
        action.value = dialogData.action;
    }

    if (action.value === JupyterSetupAction.CreateNew) {
        data.formData = new AlternativeContentForm({
            renderer: 'ipynb',
            mime: "application/x-ipynb+json"
        });
        data.entryId = dialogData.id;
        data.ready = true;
    } else if ('entryId' in dialogData) {
        data.entryId = dialogData.entryId;
    }
})

const cancel = function () {
    dialogStore.getDialogData(route).action = JupyterSetupAction.Cancel;
    dialogStore.hideDialog(route);
}

const confirm = function () {
    dialogStore.getDialogData(route).action = action.value;
    dialogStore.hideDialog(route);
}

const handleConnectorChange = function (connectorConfiguration: JupyterConnectorSettings) {
    console.log(connectorConfiguration);
    connectorSettingsChanged.value = true;
}

const testAndStoreConnectorConfiugration = function (connectorConfiguration: JupyterConnectorSettings) {
    console.log(connectorConfiguration);
    if (data.entryId !== null)
        connectionsStore.setConnectionForEntry(data.entryId, connectorConfiguration);
    if (action.value === JupyterSetupAction.FixConnectorConfiguration)
        dialogStore.hideDialog(route);
}

const closeDialog = function () {

}
</script>


<script lang="ts">
export const route = "/jupyter/modal";
</script>
