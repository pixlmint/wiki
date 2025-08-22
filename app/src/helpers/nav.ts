import { ElMessageBox, ElNotification } from "element-plus";
import { useAuthStore, useDialogStore } from "pixlcms-wrapper";
import { useBoardStore } from "../stores/board";
import { useMainStore } from "../stores/main";
import { useWikiStore } from "../stores/wiki";
import { JupyterSetupAction } from "./jupyter";
import { navigate } from "./navigator";

type WikiStore = ReturnType<typeof useWikiStore>;
type DialogStore = ReturnType<typeof useDialogStore>;
type BoardStore = ReturnType<typeof useBoardStore>;
type AuthStore = ReturnType<typeof useAuthStore>;

let wikiStore: WikiStore;
let dialogStore: DialogStore;
let boardStore: BoardStore;
let authStore: AuthStore;

const init = {
    install: function(app, options = {}) {
        const { pinia } = options;


        wikiStore = useWikiStore(pinia);
        dialogStore = useDialogStore(pinia);
        authStore = useAuthStore(pinia);
        boardStore = useBoardStore(pinia);
    }
}

const getToken = () => authStore.token;

type EntryKind = 'plain' | 'pdf' | 'ipynb' | 'board' | 'link' | 'card';

interface NavResponseElement {
    title: string,
    id: string,
    url: string,
    showing: boolean,
    children: NavResponseElement[],
    isPublic: boolean,
    isFolder: boolean,
    kind: EntryKind,
}

class Nav {
    declare root: FolderNavElement;

    constructor(root: FolderNavElement) {
        this.root = root;
    }

    static create(nav: NavResponseElement) {
        const root = NavElement.createFromResponseObject(nav) as FolderNavElement;

        return new Nav(root);
    }
}

abstract class NavElement {
    declare isPublic: boolean;
    declare kind: EntryKind;
    declare id: string;
    declare title: string;

    constructor(id: string, title: string, kind: EntryKind, isPublic: boolean = true) {
        this.id = id;
        this.title = title;
        this.kind = kind;
        this.isPublic = isPublic;
    }

    static createFromResponseObject(obj: NavResponseElement) {
        if (obj.isFolder && obj.kind === 'plain') {
            const filteredChildren = obj.children.filter(element => element.kind !== 'card');
            const children: NavElement[] = filteredChildren.map(element => {
                return NavElement.createFromResponseObject(element);
            });
            return new FolderNavElement(obj.id, obj.title, obj.kind, obj.isPublic, children);
        } else if (obj.kind === 'plain') {
            return new BasicEntryNavElement(obj.id, obj.title, obj.kind, obj.isPublic);
        } else if (obj.kind === 'board') {
            return new BoardNavElement(obj.id, obj.title, obj.kind, obj.isPublic);
        } else if (['pdf', 'ipynb'].includes(obj.kind)) {
            return new AlternativeContentNavElement(obj.id, obj.title, obj.kind, obj.isPublic);
        } else if (obj.kind === 'link') {
            return new LinkNavElement(obj.id, obj.title, obj.kind, obj.isPublic);
        } else {
            console.log(obj);
            throw "idk what to do with this";
        }
    }

    edit = () => {
        const currentRoute = location.pathname;
        navigate('/admin/edit?p=' + this.id);
        if (currentRoute === '/admin/edit') {
            wikiStore.fetchEntry(this.id).then(() => {
                const title = "Edit " + wikiStore.safeCurrentEntry.meta.title;
                useMainStore().setTitle(title)
            });
        }
    }

    rename = () => {
        ElMessageBox.prompt('Pick a new Name', 'Rename', {
            confirmButtonText: 'Ok',
            cancelButtonText: 'Cancel',
            inputValue: this.title,
        }).then(name => {
            wikiStore.renameEntry(name.value).then(() => {
                wikiStore.loadNav();
            });
        })
    }

    switchSecurity = () => {
        const newState = this.isPublic ? 'private' : 'public';
        this.isPublic = !this.isPublic;
        wikiStore.setSecurityState(this.id, newState).then(() => {
            wikiStore.loadNav();
        });
    }
}

class FolderNavElement extends NavElement {
    declare children: NavElement[];

    constructor(id: string, title: string, kind: EntryKind, isPublic: boolean = true, children: NavElement[] = []) {
        super(id, title, kind, isPublic)
        this.children = children;
    }

    deleteFolder = () => {
        confirmDelete('Are you sure you want to delete this folder and everything within it?', this.id, false);
    }

    addPage = () => {
        ElMessageBox.prompt('New Page Title', 'Add Page', {
            confirmButtonText: 'Ok',
            cancelButtonText: 'Cancel',
        }).then(name => {
            wikiStore.addEntry(this.id, name.value).then(() => {
                wikiStore.loadNav();
            });
        });
    }

    addLink = () => {
        const that = this;
        dialogStore.showDialog({
            route: '/nav/create-link', data: {}, closeCallback: function() {
                const data = dialogStore.getDialogData('/nav/create-link');

                wikiStore.addLink({ title: data.title, domain: data.domain, parentFolder: that.id });
            }
        });
    }

    addBoard = () => {
        ElMessageBox.prompt('New Board', 'Add Board', {
            confirmButtonText: 'Ok',
            cancelButtonText: 'Cancel',
        }).then(name => {
            boardStore.createBoard(this.id, name.value).then(() => {
                wikiStore.loadNav();
            });
        });
    }

    addPdf = () => {
        dialogStore.showDialog({
            route: '/nav/new-alternative-content',
            data: {
                id: this.id,
                title: "New PDF",
                mime: "application/pdf",
                renderer: 'pdf'
            }
        });
    }

    addJupyterNotebook = () => {
        dialogStore.showDialog({
            route: '/jupyter/modal',
            data: {
                id: this.id,
                title: "New Notebook",
                mime: "application/x-ipynb+json",
                renderer: 'ipynb',
                action: JupyterSetupAction.CreateNew,
            }
        });
    }

    addSubfolder = () => {
        ElMessageBox.prompt('New Subfolder', 'Add Subfolder', {
            confirmButtonText: 'Ok',
            cancelButtonText: 'Cancel',
        }).then(name => {
            wikiStore.addFolder(this.id, name.value).then(() => {
                wikiStore.loadNav();
            });
        });
    }
}

const confirmDelete = function(text: string, entryId: string, isEntry: boolean = true) {
    ElMessageBox.confirm(text, 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    }).then(() => {
        let func = () => wikiStore.deleteEntry(entryId);
        if (!isEntry) {
            func = () => wikiStore.deleteFolder(entryId, getToken());
        }
        func().then(() => {
            ElNotification({
                type: 'success',
                title: 'Success',
                message: `Successfully Deleted ${entryId}`
            });
            wikiStore.loadNav();
        });
    });
}

class BasicEntryNavElement extends NavElement {
    deletePage = () => {
        confirmDelete('Are you sure you want to delete this page?', this.id);
    }
}

class BoardNavElement extends NavElement {
    deletePage = () => {
        confirmDelete('Are you sure you want to delete this board?', this.id);
    }
}

class AlternativeContentNavElement extends NavElement {
    deletePage = () => {
        confirmDelete(`Are you sure you want to delete this ${this.kind}?`, this.id);
    }
}

class LinkNavElement extends NavElement {
    deletePage = () => {
        confirmDelete(`Are you sure you want to delete this link?`, this.id);
    }
}

export { init, Nav, NavElement, FolderNavElement, BasicEntryNavElement }

