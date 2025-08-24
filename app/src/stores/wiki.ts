import {defineStore} from 'pinia'
import {buildRequest, send} from "pixlcms-wrapper";
import {WikiEntry} from "@/src/contracts/WikiBase";
import {BoardResponse} from "@/src/contracts/Kanban";
import { Nav } from '../helpers/nav';
import { walkPath } from 'pixlcms-wrapper';

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

interface State {
    loadedEntries: WikiEntry[],
    currentEntry: WikiEntry | null,
    nav: Nav | null,
    editor: EditorState,
    openedSubmenus: String[],
}

export const useWikiStore = defineStore('wikiStore', {
    state: (): State => ({
        loadedEntries: [],
        currentEntry: null,
        nav: null,
        editor: {
            lastSaved: null,
            editingUnsavedChanges: false,
        },
        openedSubmenus: [],
    }),
    getters: {
        getLoadedEntries: (state) => state.loadedEntries,
        getCurrentEntry: (state) => state.currentEntry,
        // getNav: state => state.nav,
        // safeCurrentEntry: state => {
        //     if (state.currentEntry === null) {
        //         throw new Error('currentEntry is null');
        //     }
        //
        //     return state.currentEntry;
        // },
        getOpenedSubmenus: state => state.openedSubmenus,
    },
    actions: {
        rebuildIndex() {
            const request = buildRequest('/api/index');
            return send(request);
        },
        dumpAlternateContent(page: string | null = null) {
            const data = {};
            if (page !== null)
                data.page = page;
            const request = buildRequest('/api/admin/alternate/dump-file-into-content', data);
            return send(request);
        },
        search(query: string) {
            const request = buildRequest('/api/search', {q: query});
            return send(request);
        },
        // saveCurrentEntry() {
        //     const currentEntry = this.safeCurrentEntry;
        //     this.editor.editingUnsavedChanges = false;
        //     return this.saveEntry(currentEntry);
        // },
        // saveEntry(entry: WikiEntry | BoardResponse) {
        //     const data = {
        //         content: entry.raw_content,
        //         meta: JSON.stringify(entry.meta),
        //         entry: entry.id,
        //         lastUpdate: entry.meta.dateUpdated,
        //     }
        //     const request = buildRequest('/api/admin/entry/edit', data, 'PUT');
        //     return send(request).then(response => {
        //         this.editor.lastSaved = new Date();
        //         this.safeCurrentEntry.meta.dateUpdated = response.data.lastUpdate;
        //         this.fetchEntry(this.safeCurrentEntry.id);
        //         return response;
        //     });
        // },
        // async fetchEntry(entry: string) {
        //     const request = buildRequest('/api/entry/view', {p: entry});
        //     return send(request, true).then(response => {
        //         this.currentEntry = response.data;
        //         this.loadedEntries.push(response.data);
        //         return true;
        //     }).catch(async reason => {
        //         const parentLink = await this._testIsParentLink(entry);
        //         return false;
        //     });
        // },
        // async _testIsParentLink(entry: string) {
        //     const that = this;
        //     return await this.loadNav().then(() => {
        //         return walkPath(entry, function (parent: string) {
        //             const child = that.nav!.root.getChild(parent);
        //             if (child !== null && child.kind === 'link') {
        //                 return child;
        //             } else {
        //                 return false;
        //             }
        //         });
        //     })
        // },
        async fetchLastChanged(entry: string) {
            const request = buildRequest('/api/admin/entry/fetch-last-changed', {entry: entry});
            return send(request).then(response => {
                return new Date(response.data.lastChanged);
            });
        },
        async addLink(link: {title: string, domain: string, parentFolder: string}) {
            const request = buildRequest('/api/admin/link/add', link, 'POST');
            return send(request).then(response => {
                console.log(response);
            })
        },
        async testLink(domain: string) {
            const request = buildRequest(domain + "/api/init");
            send(request).then(response => {
                console.log(response.data);
            });
        },
        // async getCurrentEntryFromServer() {
        //     const request = buildRequest('/api/entry/view', {p: this.safeCurrentEntry.id});
        //     let response = await send(request);
        //     return response.data.raw_content;
        // },
        // addEntry(parentFolder: string, title: string) {
        //     const data = {
        //         parentFolder: parentFolder,
        //         title: title,
        //     };
        //     const request = buildRequest('/api/admin/entry/add', data, 'POST');
        //     return send(request);
        // },
        addPdf(parentFolder: string, title: string) {
            const data = {
                parentFolder: parentFolder,
                title: title,
                renderer: 'pdf',
            };
            const request = buildRequest('/api/admin/entry/upload-alternative-content', data, 'POST');
            return send(request);
        },
        // addFolder(parentFolder: string, folderName: any) {
        //     const data = {
        //         parentFolder: parentFolder,
        //         folderName: folderName,
        //     };
        //     const request = buildRequest('/api/admin/folder/add', data, 'POST');
        //     return send(request);
        // },
        // deleteFolder(folderName: string, token: string | null) {
        //     const request = buildRequest('/api/admin/folder/delete', {entry: folderName}, 'DELETE');
        //     return send(request);
        // },
        // deleteEntry(entry: string) {
        //     const request = buildRequest('/api/admin/entry/delete', {entry: entry}, 'DELETE');
        //     return send(request);
        // },
        // renameEntry(newName: string) {
        //     if (this.currentEntry === null) {
        //         throw 'Current Entry is not defined';
        //     }
        //     this.currentEntry.meta.title = newName;
        //     const data = {
        //         'new-title': newName,
        //         entry: this.currentEntry.id,
        //     }
        //     const request = buildRequest('/api/admin/entry/rename', data, 'PUT');
        //     return send(request);
        // },
        // setSecurityState(entry: string, newState: string) {
        //     const data = {
        //         entry: entry,
        //         new_state: newState,
        //     }
        //     const request = buildRequest('/api/admin/entry/change-security', data, 'PUT');
        //     return send(request);
        // },
        // async loadNav(forceReload: boolean = false) {
        //     let url = '/api/nav';
        //     if (forceReload) {
        //         url += '?forceReload=true';
        //     }
        //     const request = buildRequest(url);
        //     return send(request).then(response => {
        //         this.nav = Nav.create(response.data[0]);
        //     });
        // },
        // getEntryById(id: string): WikiEntry | null {
        //     const entries = this.getLoadedEntries;
        //     for (let i = 0; i < entries.length; i++) {
        //         const entry = entries[i];
        //         if (entry.id === id) {
        //             return entry;
        //         }
        //     }
        //
        //     return null;
        // },
    }
})
