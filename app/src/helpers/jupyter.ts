import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { DateTime } from "luxon";
import { buildRequest, EntryMeta, send, useDialogStore } from "pixlcms-wrapper";
import { useWikiStore } from "../stores/wiki";
import { WikiEntry } from "../contracts/WikiBase";
import { defineStore } from "pinia";


const MAXIMUM_CONSCECUTIVE_CONNECTION_FAILURES = 15;

export enum JupyterSetupAction {
    Cancel,
    CreateNew,
    Ask,
    OverwriteLocal,
    OverwriteRemote,
    OpenNotebook,
    UpdateConfiguration,
    FixConnectorConfiguration,
}


const generateHash = (string) => {
    let hash = 0;
    for (const char of string) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0; // Constrain to 32bit integer
    }
    return hash;
};


type JupyterConnectorSettings = {
    baseUrl: string,
    sharedFolder: {  // if null that means there is no connection
        local: string,  // Where jupyter notebooks are hosted (usually just [slash])
        shared: string,  // Where the notebooks are accessible on the lab server
    } | null,
    authToken: string | null,
}

class JupyterSession {
    notebookPath: string;
    connector: JupyterConnector | RemoteJupyterConnector;
    watchInterval: number | null = null;
    lastModified: DateTime | null = null;
    observers: Function[] = [];
    conscecutiveConnectionFailures: number = 0;
    entry: WikiEntry | null = null;

    constructor(connector: JupyterConnector | RemoteJupyterConnector, notebookPath: string) {
        this.connector = connector;
        this.notebookPath = notebookPath;
    }

    setWikiEntry(entry: WikiEntry) {
        this.entry = entry;
    }

    close() {
        this.observers = [];
        if (this.watchInterval !== null) {
            clearInterval(this.watchInterval);
        }
    }

    setupWatcher(timeout: number = 2000) {
        if (this.watchInterval !== null) {
            console.error(`Already watching ${this.notebookPath}`);
            return;
        }

        const that = this;
        this.watchInterval = window.setInterval(() => that.updateLastModified(), timeout);
    }

    updateLastModified() {
        const url = `${this.connector.settings.baseUrl}/api/contents/${this.notebookPath}/checkpoints?${DateTime.now().toSeconds()}`;
        const config: AxiosRequestConfig = {};
        if (this.connector.settings.authToken !== null) {
            config.headers = {
                Authorization: "token " + this.connector.settings.authToken,
            }
        }
        const that = this;
        axios.get(url, config).then(response => {
            if (response.data.length === 0) {
                that.conscecutiveConnectionFailures++;
                return;
            }
            const lastCheckpointTime = DateTime.fromJSDate(new Date(response.data[0].last_modified));
            if (that.lastModified === null || that.lastModified < lastCheckpointTime) {
                if (that.lastModified !== null) {
                    that.triggerUpdate();
                }
                that.lastModified = lastCheckpointTime;
            }
            that.conscecutiveConnectionFailures = 0;
        }).catch((e) => {
            that.conscecutiveConnectionFailures++;
        });
        if (this.conscecutiveConnectionFailures >= MAXIMUM_CONSCECUTIVE_CONNECTION_FAILURES) {
            console.error("Too many conscecutive connection failres, stopping checkpoint updates");
            clearInterval(this.watchInterval!);
            this.watchInterval = null;
        }
    }

    triggerUpdate() {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i]();
        }
    }

    onUpdate(func: Function) {
        this.observers.push(func);
    }

    getNotebookUrl() {
        const settings = this.connector.settings;
        let url = settings.baseUrl + "/notebooks/" + this.notebookPath;
        if (settings.authToken !== null) {
            url += "?token=" + settings.authToken;
        }

        return url;
    }
}

class JupyterConnector {
    settings: JupyterConnectorSettings;
    sessions: Record<string, JupyterSession> = {};
    isOpened: boolean = false;

    constructor(settings: JupyterConnectorSettings) {
        this.settings = settings;
    }

    createNotebook() {

    }

    open(entryPath: string): Promise<JupyterSession> {
        const entry = useWikiStore().getEntryById(entryPath);
        if (entry === null) {
            console.error("Unable to determine entry by path " + entryPath);
        }

        const nbName = entry!.meta.alternative_content;
        const splId = entry!.id.split('/')
        splId[splId.length - 1] = nbName;
        const nbPath = this.settings.sharedFolder.shared + splId.join('/')

        return new Promise(resolve => resolve(new JupyterSession(this, nbPath)));
    }

    close(notebookPath: string | null = null) {
        if (notebookPath === null) {
            for (const [notebookPath, session] of Object.entries(this.sessions)) {
                this.close(notebookPath);
            }
        } else {
            if (notebookPath in this.sessions) {
                console.log(`Closing ${notebookPath}`);
                this.sessions[notebookPath].close();
                delete this.sessions[notebookPath];
            } else {
                console.error(`No such notebook session: ${notebookPath}`);
            }
            if (Object.keys(this.sessions).length === 0) {
                this.isOpened = false;
                const that = this;
                removeEventListener('beforeunload', that.unloadHandler);
            }
        }
    }
}

class RemoteJupyterConnector extends JupyterConnector {
    async open(entryPath: string): Promise<JupyterSession> {
        const entry = useWikiStore().getEntryById(entryPath);

        if (entry === null) {
            console.error("Unable to determine entry by path " + entryPath);
        }
        const headers = this._getHeaders();

        const uniqueNotebookPath = generateHash(entryPath).toString() + ".ipynb";

        const url = this._getApiUrl(uniqueNotebookPath);
        const webUrl = `${this.settings.baseUrl}/notebooks/${uniqueNotebookPath}`;

        let existingFile;

        try {
            const response = await axios.get(url, { headers: headers });
            existingFile = response.data;
        } catch (e) {
            existingFile = null;
        }

        if (existingFile !== null) {
            console.log(existingFile);
            const dialogStore = useDialogStore();

            let action = JupyterSetupAction.Ask;

            if (entry !== null && 'jupyter_last_modified' in entry.meta) {
                const remoteLastModified = DateTime.fromJSDate(new Date(existingFile.last_modified));
                const localLastModified = DateTime.fromISO(entry.meta.jupyter_last_modified);

                if (remoteLastModified > localLastModified) {
                    action = JupyterSetupAction.OverwriteLocal;
                } else if (remoteLastModified <= localLastModified) {
                    action = JupyterSetupAction.OverwriteRemote;
                }
            }

            if (action === JupyterSetupAction.Ask) {
                action = await new Promise((resolve, reject) => {
                    dialogStore.showDialog({
                        route: "/jupyter/modal",
                        data: { action: 0 },
                        closeCallback: () => {
                            const data = dialogStore.getDialogData("/jupyter/modal")
                            resolve(data.action);
                        }
                    });
                });
            }

            switch (action) {
                case JupyterSetupAction.Cancel:
                    throw new UserCancelledOverwriteError();
                case JupyterSetupAction.OverwriteRemote:
                    await this.overwriteRemoteNotebook(url, uniqueNotebookPath, headers, entryPath);
                    console.log("Selected overwrite remote option");
                    break;
                case JupyterSetupAction.OverwriteLocal:
                    await this.overwriteLocalNotebook(url, headers, entryPath);
                    console.log("Selected overwrite loacl option");
                    break;
                case JupyterSetupAction.OpenNotebook:
                    window.open(webUrl, '_blank');
                    throw "Notebook should have opened, continue from there";
            }
        } else {
            await this.overwriteRemoteNotebook(url, uniqueNotebookPath, headers, entryPath);
        }

        this.isOpened = true;

        const session = new JupyterSession(this, uniqueNotebookPath);

        session.setupWatcher(2000);

        this.sessions[entryPath] = session;

        if (Object.keys(this.sessions).length === 1) {
            const that = this;
            addEventListener('beforeunload', that.unloadHandler);
        }

        return session;
    }

    async syncRemoteToLocal(session: JupyterSession, entry: any) {
        this.overwriteLocalNotebook(this._getApiUrl(session.notebookPath), this._getHeaders(), entry.id);
    }

    async overwriteLocalNotebook(url: string, headers: AxiosRequestHeaders, entryPath: string) {
        const entry = useWikiStore().getEntryById(entryPath);

        if (entry === null) {
            throw "Unable to determine entry by path " + entryPath;
        }

        const content = await (axios.get(url, { headers: headers }));

        if ('last_modified' in content.data) {
            const lastModified = DateTime.fromJSDate(new Date(content.data.last_modified));
            entry.meta['jupyter_last_modified'] = lastModified.toISO();
        }

        const request = buildRequest("/api/admin/entry/update-alternative-content", {
            entry: entryPath,
            meta: entry.meta,
            alternative_content_raw: JSON.stringify(content.data.content),
        }, 'POST');

        await send(request);
    }

    async overwriteRemoteNotebook(url: string, uniqueNotebookPath: string, headers: AxiosRequestHeaders, entryPath: string) {
        const request = buildRequest('/api/entry/load-jupyter-notebook', { p: entryPath });
        const content = await send(request);

        await axios.put(url, {
            content: content.data,
            format: 'json',
            path: uniqueNotebookPath,
            type: 'notebook',
        }, { headers: headers });
    }

    unloadHandler(event: Event) {
        event.preventDefault();

        console.log(event);
    }

    _getApiUrl(notebookName: string) {
        return `${this.settings.baseUrl}/api/contents/${notebookName}`;
    }

    _getHeaders(): AxiosRequestHeaders {
        if (this.settings.authToken !== null) {
            return {
                Authorization: 'token ' + this.settings.authToken,
            }
        } else {
            return {};
        }
    }
}


const createConnector = function(settings: JupyterConnectorSettings) {
    if (settings.sharedFolder === null) {
        return new RemoteJupyterConnector(settings);
    } else {
        return new JupyterConnector(settings);
    }
}

class UserCancelledOverwriteError extends Error { }

interface JupyterConnectionState {
    availableConnections: Record<string, JupyterConnectorSettings>,
    configuredConnections: Record<string, string>,
    default: string | null,
    isLoaded: boolean,
}

const storeWrapper = function() {
    const store = useJupyterConnectionsStore();

    if (!store.isLoaded) {
        console.log("loading connections");
        store.loadConnections();
    }

    return store;
}

const useJupyterConnectionsStore = defineStore('jupyterConnections', {
    state: (): JupyterConnectionState => ({
        availableConnections: {},
        configuredConnections: {},
        default: null,
        isLoaded: false,
    }),
    actions: {
        loadConnections() {
            const stored = localStorage.getItem('jupyter_connections_v1');

            if (stored !== null) {
                const obj = JSON.parse(stored);
                if ('availableConnections' in obj)
                    this.availableConnections = obj.availableConnections;
                if ('configuredConnections' in obj)
                    this.configuredConnections = obj.configuredConnections;
                if ('default' in obj)
                    this.default = obj['default'];
            }

            this.cleanupConnections();

            this.isLoaded = true;
        },
        writeConnections() {
            localStorage.setItem('jupyter_connections_v1', JSON.stringify({
                availableConnections: this.availableConnections,
                configuredConnections: this.configuredConnections,
                defaut: this.default,
            }));
        },
        getDefaultConnection(): JupyterConnectorSettings {
            if (this.default === null || !(this.default in this.availableConnections)) {
                return {
                    baseUrl: "http://localhost:8888",
                    sharedFolder: {
                        local: '/',
                        shared: '/',
                    },
                    authToken: null,
                };
            } else {
                return this.availableConnections[this.default];
            }
        },
        setDefaultConnection(config: JupyterConnectorSettings) {
            const configKey = this.getConnectionKey(config);

            this.availableConnections[configKey] = config;

            this.default = configKey;

            this.cleanupConnections();

            this.writeConnections();
        },
        updateConfiguration(old: JupyterConnectorSettings, updated: JupyterConnectorSettings) {
            const newKey = this.getConnectionKey(updated);

            this.availableConnections[newKey] = updated;
            this.cleanupConnections();

            this.writeConnections();
        },
        getConnectionForEntry(entryId: string): JupyterConnectorSettings | null {
            if (!Object.keys(this.configuredConnections).includes(entryId)) {
                return null;
            } else {
                const connectionKey = this.configuredConnections[entryId];

                if (!Object.keys(this.availableConnections).includes(connectionKey)) {
                    throw "Unable to find Connection Configuration for entry " + entryId;
                } else {
                    return this.availableConnections[connectionKey];
                }
            }
        },
        setConnectionForEntry(entryId: string, config: JupyterConnectorSettings) {
            const connectionKey = this.getConnectionKey(config);

            if (!(connectionKey in this.availableConnections)) {
                this.availableConnections[connectionKey] = config;
            }

            this.configuredConnections[entryId] = connectionKey;

            this.cleanupConnections();

            this.writeConnections();
        },
        cleanupConnections() {
            const connectionsToRemove = [];
            for (const [connectionKey, config] of Object.entries(this.availableConnections)) {
                if (!Object.values(this.configuredConnections).includes(connectionKey) && connectionKey !== this.default) {
                    connectionsToRemove.push(connectionKey);
                }
            }

            for (let i = 0; i < connectionsToRemove.length; i++) {
                delete this.availableConnections[connectionsToRemove[i]];
            }
        },
        getConnectionKey(config: JupyterConnectorSettings): string {
            let key = config.baseUrl;

            if (config.sharedFolder !== null) {
                key += config.sharedFolder.local + "_" + config.sharedFolder.shared;
            }

            return generateHash(key).toString();
        },
    }
});

export { JupyterConnector, RemoteJupyterConnector, JupyterSession, UserCancelledOverwriteError, type JupyterConnectorSettings, createConnector, storeWrapper as useJupyterConnectionsStore }

