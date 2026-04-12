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
import { useWikiStore } from "../stores/wiki";
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

function navFactory(navResponse: NavResponseElement): INav {
    return { root: navResponse };
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

const isFolder = function(el: INavElement): boolean {
    return el.kind === 'plain' && (('isFolder' in el && el.isFolder === true) || 'linkRoot' in el);
}

const isLink = function(el: INavElement) {
    return ('isFolder' in el && el.isFolder === false) && ('domain' in el && typeof el.domain !== 'undefined') && el.kind === 'link';
}

type IBaseLinkNavElement = {
    domain: string,
    originalId: string,
}

type ILinkNavElement = INavElement & IBaseLinkNavElement;
type ILinkFolderNavElement = IFolderNavElement & IBaseLinkNavElement;

const loadRemoteNav = async function(el: ILinkNavElement) {
    if (!isLink(el)) {
        throw "element is not a link";
    }
    const domain = el.domain;

    // if (!this.backendInitDone) {
    await useBackendStore().initBackend(domain);
    // this.backendInitDone = true;
    // }

    const cmsService = wikiServiceManager.getInstance(domain);

    return cmsService.cms.loadNav(false, navFactory).then(() => {
        const root = cmsService.cms.nav!.root as ILinkFolderNavElement;
        console.log(root);
        function recursivePrependId(el: ILinkNavElement | ILinkFolderNavElement, prefix: string) {
            if ('children' in el && Array.isArray(el.children)) {
                for (let i = 0; i < el.children.length; i++) {
                    recursivePrependId(el.children[i] as ILinkNavElement, prefix);
                }
            }
            el.originalId = el.id;
            el.domain = domain!;
            el.id = prefix + el.id;
        }
        recursivePrependId(root, el.id);

        if (typeof(el.children) !== 'undefined') {
            el.children.splice(0, el.children.length);
            root.children.forEach(child => {
                el.children.push(child);
            });
        } else {
            el.children = root.children;
        }
        // this.linkRoot = root;
        dispatchNavReload();
    });
}

function* walkElements(tree: IFolderNavElement) {
    function* recursiveWalk(el: INavElement): Generator<INavElement, any, unknown> {
        yield el;
        if (isLink(el)) {
            // @ts-ignore
            const children: ILinkNavElement[] = el.children;
            for (let i = 0; i < children.length; i++) {
                yield* recursiveWalk(children[i]);
            }
        } else if (isFolder(el)) {
            // @ts-ignore
            const children: INavElement[] = el.children;
            for (let i = 0; i < children.length; i++) {
                yield* recursiveWalk(children[i]);
            }
        }
    }

    yield* recursiveWalk(tree);
}

const findEntryById = function(nav: INav, id: string) {
    for (let navEl of walkElements(nav.root)) {
        if (navEl.id.replace(/\/$/g, '') === id) {
            console.log(navEl);
            return navEl;
        }
    }

    return null;
}

export {
    init,
    // Nav,
    // NavElement,
    // FolderNavElement,
    // BasicEntryNavElement,
    // LinkNavElement,
    ILinkNavElement,
    navFactory,
    isParentLink,
    isFolder,
    isLink,
    findEntryById,
    loadRemoteNav,
}

