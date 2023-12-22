import {defineStore} from 'pinia'
import {buildRequest, send} from "@/src/helpers/xhr";
import {ElNotification} from "element-plus";
import {Drawing} from "@/src/contracts/Canvas";

interface WikiEntry {
    raw_content: string,
    content: string,
    id: string,
    url: string,
    hidden: boolean,
    meta: EntryMeta,
    file: string,
}

interface EntryMeta {
    title: string,
    date_formatted: string,
    description: string | null,
    author: string | null,
    owner: string | null,
    security: string | null,
    dateUpdated: string | null,
    dateCreated: string | null,
    drawings: Drawing[] | null,
}

interface Nav extends Array<NavElement> {
}

interface NavElement {
    title: string,
    id: string,
    url: string,
    showing: boolean,
    children: Nav,
    isPublic: boolean,
}

interface EditorState {
    lastSaved: Date | null,
    editingUnsavedChanges: boolean,
}

interface WikiEntryList extends Array<WikiEntry> {
}

interface State {
    loadedEntries: WikiEntryList,
    currentEntry: WikiEntry | null,
    nav: Nav | null,
    editor: EditorState,
}

export const useWikiStore = defineStore('wikiStore', {
    state: (): State => ({
        loadedEntries: [],
        currentEntry: null,
        nav: null,
        editor: {
            lastSaved: null,
            editingUnsavedChanges: false,
        }
    }),
    getters: {
        getLoadedEntries: (state) => state.loadedEntries,
        getCurrentEntry: (state) => state.currentEntry,
        getNav: state => state.nav,
        safeCurrentEntry: state => {
            if (state.currentEntry === null) {
                throw new Error('currentEntry is null');
            }

            return state.currentEntry;
        }
    },
    actions: {
        rebuildIndex() {
            const request = buildRequest('/api/index');
            return send(request);
        },
        search(query: string) {
            const request = buildRequest('/api/search', {q: query});
            return send(request);
        },
        saveEntry() {
            const currentEntry = this.safeCurrentEntry;
            this.editor.editingUnsavedChanges = false;
            const data = {
                content: currentEntry.raw_content,
                meta: JSON.stringify(currentEntry.meta),
                entry: currentEntry.id,
                lastUpdate: currentEntry.meta.dateUpdated,
            }
            const request = buildRequest('/api/admin/entry/edit', data, 'PUT');
            return send(request).then(response => {
                this.editor.lastSaved = new Date();
                this.safeCurrentEntry.meta.dateUpdated = response.data.lastUpdate;
                this.fetchEntry(this.safeCurrentEntry.id);
                return response;
            });
        },
        fetchEntry(entry: string) {
            const request = buildRequest('/api/entry/view', {p: entry});
            return send(request).then(response => {
                this.currentEntry = response.data;
                this.loadedEntries.push(response.data);
            });
        },
        fetchLastChanged(entry: string) {
            const request = buildRequest('/api/admin/entry/fetch-last-changed', {entry: entry});
            return send(request).then(response => {
                return new Date(response.data.lastChanged);
            });
        },
        async getCurrentEntryFromServer() {
            const request = buildRequest('/api/entry/view', {p: this.safeCurrentEntry.id});
            let response = await send(request);
            return response.data.raw_content;
        },
        addEntry(parentFolder: string, title: string) {
            const data = {
                parentFolder: parentFolder,
                title: title,
            };
            const request = buildRequest('/api/admin/entry/add', data, 'POST');
            return send(request);
        },
        addPdf(parentFolder: string, title: string) {
            const data = {
                parentFolder: parentFolder,
                title: title,
                renderer: 'pdf',
            };
            const request = buildRequest('/api/admin/entry/upload-alternative-content', data, 'POST');
            return send(request);
        },
        addFolder(parentFolder: string, folderName: any) {
            const data = {
                parentFolder: parentFolder,
                folderName: folderName,
            };
            const request = buildRequest('/api/admin/folder/add', data, 'POST');
            return send(request);
        },
        deleteFolder(folderName: string, token: string | null) {
            const request = buildRequest('/api/admin/folder/delete', {entry: folderName}, 'DELETE');
            return send(request);
        },
        deleteEntry(entry: string) {
            const request = buildRequest('/api/admin/entry/delete', {entry: entry}, 'DELETE');
            return send(request).then(() => {
                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Successfully Deleted the Entry'
                });
            });
        },
        renameEntry(newName: string) {
            if (this.currentEntry === null) {
                throw 'Current Entry is not defined';
            }
            this.currentEntry.meta.title = newName;
            const data = {
                'new-title': newName,
                entry: this.currentEntry.id,
            }
            const request = buildRequest('/api/admin/entry/rename', data, 'PUT');
            return send(request);
        },
        setSecurityState(entry: string, newState: string) {
            const data = {
                entry: entry,
                new_state: newState,
            }
            const request = buildRequest('/api/admin/entry/change-security', data, 'PUT');
            return send(request);
        },
        loadNav() {
            const request = buildRequest('/api/nav');
            return send(request).then(response => {
                this.nav = response.data[0];
            });
        },
    }
})