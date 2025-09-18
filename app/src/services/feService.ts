import { dispatchNavReload, Entry, useDialogStore } from "pixlcms-wrapper";
import { navigate } from "../events";
import { LinkNavElement, Nav, NavElement, navFactory } from "../helpers/nav";
import { queryFormatter } from "../helpers/queryFormatter";
import { useWikiStore } from "../stores/wiki";
import wikiServiceManager, { Wiki } from "./wikiExtension";


type EntryIdentifier = {
    entry: string;
    domain?: string;
    relativeRoot?: string;
}

type InputEntry = string | Entry | NavElement;


function getTheEntryId(entry: InputEntry): EntryIdentifier {
    let entryId: EntryIdentifier;
    console.log(entry);

    if (typeof entry === 'string') {
        if (entry.includes('?')) {
            entry = entry.substring(entry.indexOf('?') + 1);
        }
        const params = new URLSearchParams(entry);
        if (params.has('entry')) {
            entryId = {
                entry: params.get('entry')!,
            }
        } else {
            entryId = {
                entry: entry,
            }
        }
        if (params.has('domain')) {
            entryId.domain = params.get('domain')!;
        }
        return entryId;
    } else if (entry instanceof NavElement) {
        entryId = {
            entry: entry.id,
        }

        if (typeof entry.originalId !== 'undefined') {
            entryId.relativeRoot = entry.id.replace(entry.originalId, '');
            entryId.entry = entry.originalId;
        }

        if (typeof entry.domain !== 'undefined') {
            entryId.domain = entry.domain;
        }
        return entryId;
    } else if (typeof entry.id !== 'undefined') {
        entryId = {
            entry: entry.id,
        }

        if (typeof entry.domain !== 'undefined') {
            entryId.domain = entry.domain;
        }
        return entryId;
    } else {
        console.error(entry);
        throw new Error("IDK what to do with this entry");
    }
}

let isInitialised = false;
let wikiStore: ReturnType<typeof useWikiStore> | undefined;

async function load(entry: InputEntry) {
    const entryId = getTheEntryId(entry);
    console.log(entryId);
    const service = wikiServiceManager.getInstance(entryId.domain);

    return await service!.cms.fetchEntry(entryId.entry);
}

async function view(entry: InputEntry, forceReload: boolean = true) {
    const entryId = getTheEntryId(entry);

    wikiStore!.isEditorActive = false;

    let id = entryId.entry;
    if (typeof entryId.relativeRoot !== 'undefined') {
        id = entryId.relativeRoot + entryId.entry;
    }

    navigate(id + '?' + queryFormatter(entryId));
}

async function edit(entry: InputEntry) {
    const entryId = getTheEntryId(entry);
    // const service = wikiServiceManager.getInstance(entryId.domain);

    wikiStore!.isEditorActive = true;

    // await service!.cms.fetchEntry(entryId.entry);

    navigate('/admin/edit?' + queryFormatter(entryId));
}

function showMarkdown(entry: InputEntry) {

}

function update(updatedEntry: Entry) {

}

function deleteEntry(entry: InputEntry) {

}

function openMediaDialog(forEntry: Entry) {
}

function openDrawingDialog(forEntry: Entry) {

}

function reloadNav(entry: EntryIdentifier) {
    if (typeof entry.relativeRoot === 'undefined' && typeof entry.domain === 'undefined') {
        wikiServiceManager.defaultInstance.cms.loadNav(false, navFactory);
    } else {
        const nav = wikiServiceManager.defaultInstance.cms.nav as Nav;
        let linkId: string;

        if (typeof entry.relativeRoot === 'undefined') {
            linkId = entry.entry;
        } else {
            linkId = entry.relativeRoot;
        }
        const linkEl = nav.root.getChild(linkId) as LinkNavElement;

        console.log(linkEl);

        linkEl.loadRemoteNav();
    }
}

async function addPage(folder: NavElement | Entry, title: string) {
    const entry = getTheEntryId(folder);
    const wiki = wikiServiceManager.getInstance(entry.domain);
    return wiki.cms.addEntry(entry.entry, title).then(response => {
        reloadNav(entry);
        return response;
    });
}

function addLink(folder: NavElement | Entry) {
    return new Promise<{ message: string } | void>((resolve, reject) => {
        const dialogStore = useDialogStore();

        dialogStore.showDialog({
            route: '/nav/create-link', data: {}, closeCallback: function() {
                const data = dialogStore.getDialogData('/nav/create-link');

                if (typeof data.title !== 'undefined' && typeof data.domain !== 'undefined') {
                    wikiServiceManager.defaultInstance.wiki.addLink({ title: data.title, domain: data.domain, parentFolder: folder.id }).then(response => {
                        reloadNav(getTheEntryId(folder));
                        resolve(response.data);
                    });
                } else {
                    resolve();
                }
            }
        });
    })
}

function install(app, options = {}) {
    if (isInitialised)
        return;

    const { pinia } = options;

    wikiStore = useWikiStore(pinia);

    /*let path = location.pathname;

    if (path === '/admin/edit') {
        wikiStore.isEditorActive = true;
        const s = new URLSearchParams(location.search);
        path = s.get('p')!;
    }

    wikiStore.fetchEntry(path);*/
    isInitialised = true;
}


export { edit, view, showMarkdown, update, deleteEntry as delete, openMediaDialog, openDrawingDialog, install, getTheEntryId, load, addPage, addLink };
