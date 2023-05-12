import {AxiosResponse} from 'axios';
import {defineStore} from "pinia";
import {buildRequest, send} from "@/src/helpers/xhr";
import {useAuthStore} from "@/src/stores/auth";

interface Meta {
    title: string,
    version: string,
    adminCreated: boolean,
    is_token_valid: string,
}

interface State {
    pageTitle: string,
    meta: Meta,
    editingUnsavedChanges: boolean,
    isLargeNavShowing: boolean,
    theme: string,
}

export const useMainStore = defineStore('main', {
    state: (): State => ({
        pageTitle: 'Wiki',
        meta: {
            title: 'Loading...',
            version: '0',
            adminCreated: false,
            is_token_valid: 'token_not_set',
        },
        editingUnsavedChanges: false,
        isLargeNavShowing: true,
        theme: '',
    }),
    getters: {
        getPageTitle: (state) => state.pageTitle,
        getMeta: state => state.meta,
        getTheme: state => state.theme,
    },
    actions: {
        loadTheme() {
            const deviceTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const storedTheme = localStorage.getItem('theme');

            if (storedTheme !== null && storedTheme !== undefined ) {
                this.theme = storedTheme;
            } else {
                this.theme = deviceTheme;
            }

            document.documentElement.classList.add(this.theme);
        },
        init(token: string | null) {
            const request = buildRequest('/api/init', {token: token}, 'POST');
            return send(request).then((response: AxiosResponse) => {
                if (response.data.is_token_valid !== 'token_valid') {
                    useAuthStore().logout();
                }
                this.$state.meta = response.data;

                return response;
            });
        },
        setTheme(theme: string) {
            if (theme !== 'light' && theme !== 'dark') {
                throw 'The selected theme is not supported';
            }

            document.documentElement.classList.remove(this.getTheme);
            document.documentElement.classList.add(theme);
            this.theme = theme;

            localStorage.setItem('theme', theme);
        },
        setHasUnsavedChanges(hasUnsavedChanges: boolean) {
            this.editingUnsavedChanges = hasUnsavedChanges;
        },
        setTitle(title: string) {
            if (title === 'Wiki') {
                document.title = 'Wiki';
            } else {
                document.title = title + ' · Wiki';
            }
            this.$state.pageTitle = title;
        },
        toggleLargeNavShowing(isLargeNavShowing: boolean) {
            this.isLargeNavShowing = isLargeNavShowing;
        },
    },
})