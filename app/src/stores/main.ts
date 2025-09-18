import { defineStore } from "pinia";
import { useBackendStore } from "pixlcms-wrapper";

interface Meta {
    title: string,
    pluginVersion: string,
    cmsVersion: string,
    frontendVersion: string,
    adminCreated: boolean,
    is_token_valid: string,
    debugEnabled: boolean,
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
            debugEnabled: false,
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
        async init() {
            const backendStore = useBackendStore();

            return backendStore.initBackend().then(response => {
                const data = response.data;
                data.pluginVersion = data.wikiVersion;
                data.cmsVersion = data.version;
                this.$state.meta = response.data;

                return response;
            });
            // const request = buildRequest('/api/init', {token: token}, 'POST');
            // // @ts-ignore
            // return send(request).then((response: AxiosResponse) => {
            //     if (response.data.is_token_valid !== 'token_valid') {
            //         useAuthStore().logout();
            //     }
            // });
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
