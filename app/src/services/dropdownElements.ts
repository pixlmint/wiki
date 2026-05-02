import { ElMessageBox } from "element-plus";
import * as feService from "@/src/services/feService";
import { cmsService, IFolderNavElement, INavElement, serviceManager, useDialogStore } from "pixlcms-wrapper";
import { ILinkNavElement } from "../helpers/nav";
import { computed, h } from "vue";
import type { ComputedRef } from "vue";
import { Icon } from "pixlcms-wrapper";
import { VNode } from "veaury";

type FolderElement = IFolderNavElement | ILinkNavElement;
type LoadingFunction = (isLoading: boolean) => void;

export type DropdownElementConfiguration = {
    action: (() => void) | ((element: FolderElement) => void);
    title: string | ComputedRef<string>;
    icon?: string | { package: string, icon: string } | ComputedRef<string>;
    iconElement?: VNode;
    className?: string;
}

const toggleVisibilityAction = (
    element: INavElement | FolderElement,
    toggleLoading: LoadingFunction
) => {
    return {
        title: computed(() => {
            return element.isPublic ? 'Set Private' : 'Set Public';
        }),
        iconElement: h(Icon, {
            icon: element.isPublic ? 'lock' : 'unlock',
        }),
        action: async () => {
            toggleLoading(true);
            await feService.setVisibility(element.id, element.isPublic ? 'private' : 'public');
            element.isPublic = !element.isPublic;
            toggleLoading(false);
        },
    }
}


const deleteElementAction = (
    element: INavElement | FolderElement,
    title: string,
    toggleLoading: LoadingFunction
) => {
    return {
        title: title,
        icon: "trash",
        className: 'danger',
        action: () => {
            ElMessageBox.confirm(
                `delete ${element.id}?`,
                'Danger',
                {
                    confirmButtonText: 'Delete',
                    cancelButtonText: 'Cancel',
                    type: 'danger',
                },
            ).then(async () => {
                toggleLoading(true);
                await feService.delete(element);
                toggleLoading(false);
            })
        },
    }
}


const linkElementAction = (
    element: INavElement | FolderElement,
    _: LoadingFunction
) => {
    return {
        title: "New Link",
        action: () => {
            feService.addLink(element);
        },
    }
}


const coreFolderActions = (
    element: INavElement,
    _: LoadingFunction
) => [
        {
            title: "Add Page",
            icon: "file-circle-plus",
            action: () => {
                ElMessageBox.prompt('New Page Title', 'Add Page', {
                    confirmButtonText: 'Ok',
                    cancelButtonText: 'Cancel',
                }).then(name => {
                    feService.addPage(element, name.value);
                });
            },
        },
        {
            title: "Add PDF",
            icon: "file-circle-plus",
            action: () => {

            },
        },
        {
            title: "New Jupyter Notebook",
            icon: "file-circle-plus",
            action: () => {
                useDialogStore().showDialog({ route: '/nav/new-alternative-content', data: { id: element.id, title: "New Notebook", mime: "application/json" } });
            },
        },
        {
            title: "Add Subfolder",
            icon: "folder-plus",
            action: () => {
                ElMessageBox.prompt('New Subfolder', 'Add Subfolder', {
                    confirmButtonText: 'Ok',
                    cancelButtonText: 'Cancel',
                }).then(name => {
                    feService.addFolder(element, name.value);
                })
            },
        },
        {
            title: "Add Board",
            icon: { package: "brands", icon: "trello" },
            action: () => {
            },
        },
    ];

export const createFolderActions = (
    element: INavElement,
    toggleLoading: LoadingFunction
): DropdownElementConfiguration[] => [
        ...coreFolderActions(element, toggleLoading),
        linkElementAction(element, toggleLoading),
        toggleVisibilityAction(element, toggleLoading),
        deleteElementAction(element, "Delete Folder", toggleLoading),
    ];

export const createLinkActions = (
    element: INavElement,
    toggleLoading: LoadingFunction
) => {
    const isSignedIn = serviceManager.getInstance(element.domain).auth.token !== null;

    const ret: DropdownElementConfiguration[] = [];

    if (isSignedIn) {
        ret.push(...coreFolderActions(element, toggleLoading));
    } else {
        ret.push({
            title: "Login",
            icon: "user",
            action: () => {
                useDialogStore().showDialog({
                    route: "/auth/login",
                    data: {
                        domain: element.domain,
                    },
                });
            },
        });
    }

    ret.push({
        title: "Reload Nav",
        action: () => {

        },
    });

    return ret;
}

export const createRootFolderActions = (): DropdownElementConfiguration[] => {
    const mockElement: INavElement = {
        isPublic: true,
        id: '/',
        title: '',
        kind: 'plain',
    };
    const mockFunc = (_: boolean) => { };

    return [
        ...coreFolderActions(mockElement, mockFunc),
        linkElementAction(mockElement, mockFunc),
    ];
}

export const createEntryActions = (
    element: INavElement,
    toggleLoading: LoadingFunction
): DropdownElementConfiguration[] => [
        {
            title: "Edit",
            icon: "pen",
            action: () => {
                feService.edit(element.id);
            },
        },
        {
            title: "Rename",
            icon: "pen-to-square",
            action: () => {
                ElMessageBox.prompt('Name', 'Tip', {
                    inputValue: element.title,
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                })
                    .then(async ({ value }) => {
                        toggleLoading(true);
                        await feService.rename(element, value);
                        element.title = value;
                        toggleLoading(false);
                    })
                    .catch(() => {
                        toggleLoading(false);
                    })
            },
        },
        toggleVisibilityAction(element, toggleLoading),
        deleteElementAction(element, "Delete Entry", toggleLoading),
    ];

