import axios from 'axios';

const state = {
    isLoading: false,
    showEditSpecificPopup: false,
    pageTitle: '2022',
};

const mutations = {
    LOADING(state, isLoading) {
        state.isLoading = isLoading;
    },
    EDIT_SPECIFIC_POPUP(state, showEditSpecificPopup) {
        state.showEditSpecificPopup = showEditSpecificPopup;
    },
}

const actions = {
    setTitle({
        commit
    }, title) {
        if (title === '2022') {
            document.title = '2022';
        } else {
            document.title = title + ' · 2022';
        }
        state.pageTitle = title;
    },
    buildCache(asdf, token) {
        axios.post('/api/admin/build-cache?token=' + token);
    },
}

const getters = {
    loading: state => state.isLoading,
    showEditSpecificPopup: state => state.showEditSpecificPopup,
    pageTitle: state => state.pageTitle,
}

const mainModule = {
    state,
    mutations,
    actions,
    getters,
}

export default mainModule;