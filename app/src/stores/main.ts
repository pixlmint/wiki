import axios from 'axios';
import {defineStore} from "pinia";

interface State {
    isLoading: boolean,
    pageTitle: string,
}

export const useMainStore = defineStore('main', {
    state: (): State => ({
        isLoading: false,
        pageTitle: 'Wiki',
    }),
    getters: {
        getIsLoading: (state) => state.isLoading,
        getPageTitle: (state) => state.pageTitle,
    },
    actions: {
        setIsLoading(isLoading: boolean) {
            this.isLoading = isLoading
        },
        setTitle(title: string) {
            if (title === 'Wiki') {
                document.title = 'Wiki';
            } else {
                document.title = title + ' · Wiki';
            }
            this.$state.pageTitle = title;
        },
        buildCache(token: string) {
            axios.post('/api/admin/build-cache?token=' + token);
        },
    },
})