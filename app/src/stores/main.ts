import {AxiosResponse} from 'axios';
import {defineStore} from "pinia";
import {buildRequest, send} from "@/src/helpers/xhr";
import {useAuthStore} from "@/src/stores/auth";

interface Meta {
    title: string,
    pluginVersion: string,
    cmsVersion: string,
    frontendVersion: string,
    adminCreated: boolean,
    is_token_valid: string,
}

interface State {
    pageTitle: string,
    meta: Meta,
    editingUnsavedChanges: boolean,
    isLargeNavShowing: boolean,
    isSearchShowing: boolean,
}

export const useMainStore = defineStore('main', {
    state: (): State => ({
        pageTitle: 'Wiki',
        meta: {
            title: 'Loading...',
            frontendVersion: '0',
            cmsVersion: '0',
            pluginVersion: '0',
            adminCreated: false,
            is_token_valid: 'token_not_set',
        },
        editingUnsavedChanges: false,
        isLargeNavShowing: true,
        isSearchShowing: false,
    }),
    getters: {
        getPageTitle: (state) => state.pageTitle,
        getMeta: state => state.meta,
    },
    actions: {
        init(token: string | null) {
            const request = buildRequest('/api/init', {token: token}, 'POST');
            return send(request).then((response: AxiosResponse) => {
                if (response.data.is_token_valid !== 'token_valid') {
                    useAuthStore().logout();
                }
                const data = response.data;
                data.pluginVersion = data.wikiVersion;
                data.cmsVersion = data.version;
                this.$state.meta = response.data;

                return response;
            });
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