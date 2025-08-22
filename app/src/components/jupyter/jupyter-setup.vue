<template>
    <el-form label-width="auto">
        <el-form-item label="Base URL">
            <el-input @change="handleChange" v-model="form.baseUrl" />
        </el-form-item>

        <el-form-item label="Is shared?">
            <el-switch v-model="form.isShared" />
        </el-form-item>

        <template v-if="form.isShared">
            <el-form-item label="Local Path">
                <el-input @change="handleChange" v-model="form.localPath" />
            </el-form-item>
            <el-form-item label="Shared Path">
                <el-input @change="handleChange" v-model="form.sharedPath" />
            </el-form-item>
        </template>

        <el-form-item label="Token">
            <el-input @change="handleChange" v-model="form.token" />
        </el-form-item>

        <el-form-item label="Make Default">
            <el-switch @change="handleChange" v-model="form.makeDefault" />
        </el-form-item>

        <el-button @click="save">Confirm</el-button>
    </el-form>
</template>

<script lang="ts" setup>
import { onMounted, reactive, watch } from 'vue';
import { type JupyterConnectorSettings, useJupyterConnectionsStore } from "@/src/helpers/jupyter";

const emit = defineEmits(["save", "change", "unchanged"]);

type FlatSettings = {
    readonly baseUrl?: string | undefined;
    readonly localPath?: string | undefined;
    readonly sharedPath?: string | undefined;
    readonly token?: string | undefined;
};

const props = defineProps<{settings: JupyterConnectorSettings | null}>();

const connectionsStore = useJupyterConnectionsStore();

const form = reactive({
    baseUrl: props.settings?.baseUrl,
    isShared: true,
    localPath: props.settings?.sharedFolder?.local,
    sharedPath: props.settings?.sharedFolder?.shared,
    token: props.settings?.authToken,
    makeDefault: false,
});


onMounted(() => {
    const defaultConnection = connectionsStore.getDefaultConnection();

    if (!props.settings) {
        form.baseUrl = defaultConnection.baseUrl;
        if (defaultConnection.sharedFolder === null) {
            form.isShared = false;
        } else {
            form.localPath = defaultConnection.sharedFolder.local;
            form.sharedPath = defaultConnection.sharedFolder.shared;
            form.isShared = true;
        }
        form.token = defaultConnection.authToken ? defaultConnection.authToken : '';
    } else {
        form.isShared = props.settings.sharedFolder !== null;
    }
});

const handleChange = function () {
    if (form.baseUrl !== props.settings?.baseUrl || form.localPath !== props.settings?.sharedFolder?.local || form.sharedPath !== props.settings?.sharedFolder?.shared || form.token !== props.settings?.authToken || form.makeDefault) {
        emit("change", form);
    } else {
        emit("unchanged", form);
    }
}

const convertFlat2Settings = function (flatObj: FlatSettings): JupyterConnectorSettings {
    const settings: JupyterConnectorSettings = {
        baseUrl: flatObj.baseUrl!,
        sharedFolder: null,
        authToken: flatObj.token!,
    }

    if (flatObj.isShared) {
        settings.sharedFolder = {
            local: flatObj.localPath!,
            shared: flatObj.sharedPath!,
        }
    }

    return settings;
}

const save = function () {
    const settings = convertFlat2Settings(form);

    if (props.settings?.baseUrl === null) {
        // It's a new config
        // Nothing to do
    } else {
        connectionsStore.updateConfiguration(props.settings, settings);
    }

    if (form.makeDefault) {
        connectionsStore.setDefaultConnection(settings);
    }

    emit('save', settings);
}
</script>
