import { ElMessageBox } from "element-plus";
import * as feService from "@/src/services/feService";
import { IFolderNavElement, INav, INavElement, useDialogStore } from "pixlcms-wrapper";
import { ILinkNavElement } from "../helpers/nav";
import { computed, h } from "vue";
import type { ComputedRef, Ref } from "vue";
import { Icon } from "pixlcms-wrapper";
import { VNode } from "veaury";

type FolderElement = IFolderNavElement | ILinkNavElement;

export type DropdownElementConfiguration = {
    action: (() => void) | ((element: FolderElement) => void);
    title: string | ComputedRef<string>;
    icon?: string | { package: string, icon: string } | ComputedRef<string>;
    iconElement?: VNode;
    className?: string;
}

const toggleVisibilityAction = (element: INavElement | FolderElement, toggleLoading: (isLoading: boolean) => void) => {
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


const deleteElementAction = (element: INavElement | FolderElement, title: string, toggleLoading: (isLoading: boolean) => void) => {
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


const coreFolderActions = (element: INavElement, _: (isLoading: boolean) => void) => [
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
    {
        title: "New Link",
        action: () => {
            feService.addLink(element);
        },
    },
];

export const createFolderActions = (element: INavElement, toggleLoading: (isLoading: boolean) => void): DropdownElementConfiguration[] => {
    return [
        ...coreFolderActions(element, toggleLoading),
        toggleVisibilityAction(element, toggleLoading),
        deleteElementAction(element, "Delete Folder", toggleLoading),
    ]
}

export const createRootFolderActions = (): DropdownElementConfiguration[] => {
    return coreFolderActions({
        isPublic: true,
        id: '/',
        title: '',
        kind: 'plain',
    }, (_: boolean) => {});
}

export const createEntryActions = (element: INavElement, toggleLoading: (isLoading: boolean) => void): DropdownElementConfiguration[] => {
    return [
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
}

