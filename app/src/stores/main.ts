import axios from 'axios';
import {defineStore} from "pinia";

interface State {
    pageTitle: string,
}

export const useMainStore = defineStore('main', {
    state: (): State => ({
        pageTitle: 'Wiki',
    }),
    getters: {
        getPageTitle: (state) => state.pageTitle,
    },
    actions: {
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