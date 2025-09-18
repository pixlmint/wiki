import * as feService from "../services/feService";
import { Entry, useDialogStore } from "pixlcms-wrapper";
import { route as kanbanRoute } from "@/src/components/kanban/board-settings.vue";

export type DropdownItem = {
    onClick: (entry: Entry) => Promise<void> | void;
    elIcon?: string | {
        icon: string,
        package: 'brands',
    };
    title: string;
    class?: string,
}

export type DropdownConfig = {
    primaryAction: DropdownItem;
    actions: DropdownItem[];
}

const actions: Record<string, DropdownItem> = {
    edit: {
        onClick: feService.edit,
        title: 'Edit',
        elIcon: 'edit'
    },
    showMarkdown: {
        onClick: feService.showMarkdown,
        title: 'View RAW',
        elIcon: {
            icon: 'markdown',
            package: 'brands',
        },
    },
    uploadMedia: {
        onClick: feService.openMediaDialog,
        title: 'Media',
        elIcon: 'image',
    },
    addDrawing: {
        onClick: feService.openDrawingDialog,
        title: 'Add Drawing',
        elIcon: 'pen-ruler',
    },
    deleteEntry: {
        onClick: feService.delete,
        title: 'Delete',
        elIcon: 'trash',
        class: 'danger',
    },
    kanbanSettings: {
        onClick: function(entry: Entry) {
            useDialogStore().showDialog(kanbanRoute);
        },
        title: 'Settings',
        elIcon: 'gear',
    },
    dumpJupyter: {
        onClick: function(entry: Entry) {
            console.trace();
        },
        title: "Dump Jupyter NB",
        elIcon: 'file-arrow-down',
    },
}


export const PLAIN_ENTRY_ACTIONS: DropdownConfig = {
    primaryAction: actions.edit,
    actions: [
        actions.showMarkdown,
        actions.uploadMedia,
        actions.addDrawing,
        actions.deleteEntry,
    ]
};

export const KANBAN_ENTRY_ACTIONS: DropdownConfig = {
    primaryAction: actions.kanbanSettings,
    actions: [
        actions.deleteEntry,
    ]
};

export const IPYNB_ENTRY_ACTIONS: DropdownConfig = {
    primaryAction: actions.edit,
    actions: [
        actions.dumpJupyter,
        actions.deleteEntry,
    ]
};

export const PDF_ENTRY_ACTIONS: DropdownConfig = {
    primaryAction: actions.edit,
    actions: [
        actions.deleteEntry,
    ],
}
