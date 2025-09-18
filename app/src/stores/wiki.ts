import { defineStore } from 'pinia'
import { buildRequest, cmsService, Entry, send } from "pixlcms-wrapper";
import serviceManager, { Wiki } from '../services/wikiExtension';
import { FolderNavElement, Nav } from '../helpers/nav';

interface State {
    currentEntry: Entry | null,
    editor: {
        lastSaved: Date | null,
        editingUnsavedChanges: boolean,
    },
    isEditorActive: boolean,
    openedSubmenus: string[],
    backendmap: Record<string, string | 'default'>,
    nav: Nav | null;
}

export const useWikiStore = defineStore('wikiStore', {
    state: (): State => ({
        currentEntry: null,
        isEditorActive: false,
        editor: {
            lastSaved: null,
            editingUnsavedChanges: false,
        },
        openedSubmenus: [],
        backendmap: {},
        nav: null,
    }),
    actions: {
        async fetchEntry(entryId: string) {
            return this.loadEntry(entryId).then(entry => {
                this.currentEntry = entry;
            });
        },
        loadEntry(entryId: string): Promise<Entry> {
            const service = this._getServiceForEntry(entryId);
            const actualEntryId = this._getActualEntryId(entryId);
            if (typeof service.getDomain() === 'undefined') {
                this.backendmap[actualEntryId] = 'default';
            } else {
                this.backendmap[actualEntryId] = service.getDomain()!;
            }
            return service.cms.fetchEntry(actualEntryId);
        },
        getEntryDomain(entryId: string): string | undefined {
            if (typeof cmsService.nav !== 'undefined') {
                const nav = cmsService.nav as Nav;

                const el = nav!.findEntryById(entryId);

                if (el !== null) {
                    return el.domain;
                }
            }

        },
        _getActualEntryId(entryId: string): string {
            if (typeof cmsService.nav !== 'undefined') {
                const nav = cmsService.nav as Nav;

                const el = nav!.findEntryById(entryId);

                if (el !== null && typeof el.originalId !== 'undefined') {
                    return el.originalId;
                }
            }

            return entryId;
        },
        _getServiceForEntry(entryId: string): Wiki {
            if (entryId in this.backendmap && this.backendmap[entryId] !== 'default') {
                return serviceManager.getInstance(this.backendmap[entryId]);
            }
            if (typeof cmsService.nav !== 'undefined') {
                const nav = cmsService.nav as Nav;

                const el = nav!.findEntryById(entryId);

                if (el !== null && typeof el.domain !== 'undefined') {
                    return serviceManager.getInstance(el.domain);
                } else {
                    return serviceManager.defaultInstance;
                }
            } else {
                return serviceManager.defaultInstance;
            }
        },
        saveCurrentEntry() {
            this.editor.editingUnsavedChanges = false;
            return this._getServiceForEntry(this.currentEntry.id).cms.saveEntry(this.currentEntry);
        },
        async fetchLastChanged(entry: string) {
            return this._getServiceForEntry(entry).cms.fetchLastChanged(entry);
        },
        async addLink(link: { title: string, domain: string, parentFolder: string }) {
        },
        async testLink(domain: string) {
            const request = buildRequest(domain + "/api/init");
            console.log(request);
            send(request).then(response => {
                console.log(response);
            });
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
    }
})
