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
        // getEntryDomain(entryId: string): string | undefined {
        //     if (typeof cmsService.nav !== 'undefined') {
        //         const nav = cmsService.nav as Nav;

        //         const el = nav!.findEntryById(entryId);

        //         if (el !== null) {
        //             return el.domain;
        //         }
        //     }

        // },
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
        async handleCheckboxToggle(checkboxId: number, newState: boolean): Promise<void> {
            const re = /^.*(\[\s?x?\s?\]).*$/gm;
            let text = this.currentEntry!.raw_content;

            const matches = [...text.matchAll(re)];

            if (matches.length <= checkboxId) {
                throw "Unable to find this checkbox";
            }

            // XXX: This won't work with multiple checkboxes in one line
            const match = matches[checkboxId];
            let line = match[0];

            const newBox = newState ? '[x]' : '[ ]';
            line = line.replace(match[1], newBox);
            text = text.slice(0, match.index) + line + text.slice(match.index! + match[0].length);
            
            this.currentEntry!.raw_content = text;

            const doc = new DOMParser().parseFromString('<root>' + this.safeCurrentEntry!.content + '</root>', "text/xml");
            const boxes = doc.querySelectorAll('input[type="checkbox"]');

            let reloadContent = false
            if (boxes.length > checkboxId) {
                const box = boxes[checkboxId];
                if (newState) {
                    box.setAttribute('checked', '1');
                } else {
                    box.removeAttribute('checked');
                }
                this.safeCurrentEntry!.content = doc.firstElementChild!.innerHTML
            } else {
                reloadContent = true;
            }
            await this.saveCurrentEntry(!reloadContent);
        }
    }
})
