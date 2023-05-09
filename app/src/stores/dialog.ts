import {defineStore} from "pinia";

interface Dialog {
    showing: boolean,
    route: string,
}

interface State {
    dialogs: {
        login: Dialog,
    },
    showingDialog: string | boolean,
}

export const useDialogStore = defineStore('dialog', {
    state: (): State => ({
        showingDialog: false,
        dialogs: {
            login: {
                showing: false,
                route: '/auth/login',
            },
        },
    }),
    getters: {
        getShowingDialog: state => state.showingDialog,
    },
    actions: {
        showDialog(route: string) {
            this.showingDialog = route;
            for (const key in this.dialogs) {
                const dialogRoute = this.dialogs[key].route;
                if (dialogRoute === route) {
                    this.dialogs[key].showing = true;
                }
            }
        },
        clearShowingDialog() {
            this.showingDialog = false;
            for (const key in this.dialogs) {
                this.dialogs[key].showing = true;
            }
        },
    }
});