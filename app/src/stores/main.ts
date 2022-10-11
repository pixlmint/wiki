import axios from 'axios';
import {defineStore} from "pinia";

interface State {
    isLoading: boolean,
    pageTitle: string,
}

export const useMainStore = defineStore('main', {
    state: (): State => ({
        isLoading: false,
        pageTitle: '2022',
    }),
    getters: {
        loading: (state) => state.isLoading,
        pageTitle: (state) => state.pageTitle,
    },
    actions: {
        setIsLoading(isLoading: boolean) {
            state.isLoading = isLoading
        },
        setTitle(title: string) {
            if (title === '2022') {
                document.title = '2022';
            } else {
                document.title = title + ' · 2022';
            }
            state.pageTitle = title;
        },
        buildCache(token: string) {
            axios.post('/api/admin/build-cache?token=' + token);
        },
    },
})