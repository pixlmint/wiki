<template>
    <jupyter-frame v-if="session !== null" :notebookUrl="notebookUrl" />
    <el-button @click="changeSettings">Change Settings</el-button>
</template>

<script lang="ts" setup>
import JupyterFrame from "@/src/components/jupyter/jupyter-frame.vue";
// import JupyterSetup from "@/src/components/jupyter/jupyter-setup.vue";
import { useWikiStore } from "@/src/stores/wiki";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { createConnector, JupyterSession, JupyterConnector, RemoteJupyterConnector, type JupyterConnectorSettings, useJupyterConnectionsStore } from "@/src/helpers/jupyter";
import { useDialogStore } from "pixlcms-wrapper";
import { JupyterSetupAction } from "@/src/helpers/jupyter";

const wikiStore = useWikiStore();

let connector: JupyterConnector | RemoteJupyterConnector | null = null;

const connectionsStore = useJupyterConnectionsStore();
const dialogStore = useDialogStore();

const session = ref<JupyterSession | null>(null);

const settings = reactive({
    setupModalShowing: true,
    isReady: false,
    baseUrl: '',
    sharedFolder: null,
    authToken: null,
});

const notebookUrl = computed(() => {
    if (session.value === null) {
        console.error("Not yet ready");
    }
    return session.value?.getNotebookUrl();
});

const configure = async function (setup: JupyterConnectorSettings) {
    settings.setupModalShowing = false;
    settings.baseUrl = setup.baseUrl;
    settings.sharedFolder = setup.sharedFolder;
    settings.authToken = setup.authToken;
    connector = createConnector(settings);

    try {
        const newSession = await connector.open(wikiStore.safeCurrentEntry.id);
        if (connector instanceof RemoteJupyterConnector) {
            newSession.onUpdate(() => {
                connector!.syncRemoteToLocal(newSession, wikiStore.safeCurrentEntry);
            })
        }
        session.value = newSession;

        settings.isReady = true;
    } catch (e) {
        console.error(e);
    }
}

const changeSettings = function () {
    settings.setupModalShowing = true;
}

onMounted(() => {
    const configuredSettings = connectionsStore.getConnectionForEntry(wikiStore.safeCurrentEntry.id);

    console.log(configuredSettings);

    if (configuredSettings === null) {
        dialogStore.showDialog({
            route: "/jupyter/modal",
            data: {
                entryId: wikiStore.safeCurrentEntry.id,
                action: JupyterSetupAction.FixConnectorConfiguration,
            },
            closeCallback: onSetupDialogClose,
        });
    } else {
        configure(configuredSettings);
    }
});

const onSetupDialogClose = function() {
    const connection = connectionsStore.getConnectionForEntry(wikiStore.safeCurrentEntry.id);
    if (connection !== null)
        configure(connection);
    else
        throw "No connection found for entry " + wikiStore.safeCurrentEntry.id;
}

// onMounted(() => {
//     configure({
//         baseUrl: 'http://localhost:8889',
//         sharedFolder: null,
//         authToken: 'asdf',
//     })
// })

onUnmounted(() => {
    if (connector !== null) {
        connector.close(wikiStore.safeCurrentEntry.id);
    }
});
</script>

<style scoped>
.jupyter-iframe {
    width: 100%;
    height: 100vh;
    border: none;
}
</style>
