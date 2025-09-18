import { ElMessageBox, ElNotification } from "element-plus";
import {
    useAuthStore,
    useBackendStore,
    useDialogStore,
    INav,
    INavElement,
    IFolderNavElement,
    walkPath,
    dispatchNavReload,
} from "pixlcms-wrapper";
import { useBoardStore } from "../stores/board";
import { useMainStore } from "../stores/main";
import { useWikiStore } from "../stores/wiki";
import { JupyterSetupAction } from "./jupyter";
import { navigate } from "../events";
import wikiServiceManager from "../services/wikiExtension";

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
    domain?: string,
}

class Nav implements INav {
    declare root: FolderNavElement;

    constructor(root: FolderNavElement) {
        this.root = root;
    }

    findEntryById(id: string): NavElement | null {
        for (let navEl of this.root.walkElements()) {
            if (navEl.id === id) {
                return navEl;
            }
        }

        return null;
    }

    static create(nav: NavResponseElement) {
        const root = NavElement.createFromResponseObject(nav) as FolderNavElement;

        return new Nav(root);
    }
}

function navFactory(navResponse: NavResponseElement) {
    return Nav.create(navResponse);
}

abstract class NavElement implements INavElement {
    declare isPublic: boolean;
    declare kind: EntryKind;
    declare id: string;
    declare title: string;

    declare domain?: string;
    declare originalId?: string;

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
            return new LinkNavElement(obj.id, obj.title, obj.kind, obj.domain!, obj.isPublic);
        } else {
            console.log(obj);
            throw "idk what to do with this";
        }
    }

    *walkElements() {
        function* recursiveWalk(el: NavElement): Generator<NavElement, any, unknown> {
            yield el;
            if ('getChildren' in el && typeof el.getChildren === 'function') {
                const children: NavElement[] = el.getChildren();
                for (let i = 0; i < children.length; i++) {
                    yield* recursiveWalk(children[i]);
                }
            }
        }

        yield* recursiveWalk(this);
    }

    abstract delete: () => void;

    edit = () => {
        const currentRoute = location.pathname;
        navigate('/admin/edit?p=' + this.id);
        if (currentRoute === '/admin/edit') {
            wikiStore.fetchEntry(this.id).then(() => {
                const title = "Edit " + wikiStore.currentEntry.meta.title;
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
            wikiServiceManager.getInstance(this.domain).cms.renameEntry(this.id, name.value);
        });
    }

    switchSecurity = () => {
        const newState = this.isPublic ? 'private' : 'public';
        this.isPublic = !this.isPublic;
        wikiServiceManager.getInstance(this.domain).cms.setSecurityState(this.id, newState);
        // wikiStore.setSecurityState(this.id, newState).then(() => {
        //     wikiStore.loadNav();
        // });
    }
}

class FolderNavElement extends NavElement implements IFolderNavElement {
    declare children: NavElement[];

    constructor(id: string, title: string, kind: EntryKind, isPublic: boolean = true, children: NavElement[] = []) {
        super(id, title, kind, isPublic)
        this.children = children;
    }

    getChildren = () => {
        return this.children;
    }

    getChild = (id: string): null | NavElement => {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (child.id === id) {
                return child;
            } else if (child instanceof FolderNavElement) {
                const childMatch = child.getChild(id);
                if (childMatch !== null) {
                    return childMatch;
                }
            }
        }

        return null;
    }

    delete = () => {
        confirmDelete('Are you sure you want to delete this folder and everything within it?', this.id, false);
    }

    addPage = () => {
    }

    addLink = () => {
        const that = this;
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
    delete = () => {
        confirmDelete('Are you sure you want to delete this page?', this.id);
    }
}

class BoardNavElement extends NavElement {
    delete = () => {
        confirmDelete('Are you sure you want to delete this board?', this.id);
    }
}

class AlternativeContentNavElement extends NavElement {
    delete = () => {
        confirmDelete(`Are you sure you want to delete this ${this.kind}?`, this.id);
    }
}

class LinkNavElement extends NavElement {
    declare linkRoot?: FolderNavElement;
    declare domain: string;
    declare backendInitDone: boolean;

    constructor(id: string, title: string, kind: EntryKind, domain: string, isPublic: boolean = true) {
        super(id, title, kind, isPublic);
        this.domain = domain;
        this.backendInitDone = false;
    }

    getChildren = () => {
        if (typeof this.linkRoot === 'undefined')
            return [];
        else
            return this.linkRoot.children;
    }

    loadRemoteNav = async () => {
        const domain = this.domain;

        if (!this.backendInitDone) {
            await useBackendStore().initBackend(domain);
            this.backendInitDone = true;
        }

        const cmsService = wikiServiceManager.getInstance(domain);
        return cmsService.cms.loadNav(false, navFactory).then(() => {
            const root = cmsService.cms.nav!.root as FolderNavElement;
            function recursivePrependId(el: NavElement, prefix: string) {
                if ('children' in el && Array.isArray(el.children)) {
                    for (let i = 0; i < el.children.length; i++) {
                        recursivePrependId(el.children[i], prefix);
                    }
                }
                el.originalId = el.id;
                el.domain = domain;
                el.id = prefix + el.id;
            }
            recursivePrependId(root, this.id);
            this.linkRoot = root;
            dispatchNavReload();
        });
    }

    delete = () => {
        confirmDelete(`Are you sure you want to delete this link?`, this.id);
    }

    addPage = () => this.linkRoot!.addPage();

    addPdf = () => this.linkRoot!.addPdf();

    addJupyterNotebook = () => this.linkRoot!.addJupyterNotebook();

    addSubfolder = () => this.linkRoot!.addSubfolder();

    addBoard = () => this.linkRoot!.addBoard();

    addLink = () => {
        throw "Links cannot contain more links";
    }
}

const isParentLink = function(el: NavElement, nav: Nav): false | LinkNavElement {
    const child = walkPath<LinkNavElement>(el.id, function(parent: string) {
        const child = nav.findEntryById(parent);
        if (child !== null && child.kind === 'link') {
            return child;
        } else {
            return false;
        }
    })

    if (typeof child !== 'undefined') {
        return child;
    } else {
        return false;
    }
}

const isFolder = function(el: NavElement): boolean {
    return 'getChildren' in el;
}

const isLink = function(el: NavElement) {
    return 'linkRoot' in el || isFolder(el) && !('children' in el);
}

export { init, Nav, NavElement, FolderNavElement, BasicEntryNavElement, LinkNavElement, navFactory, isParentLink, isFolder, isLink }

