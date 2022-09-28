import axios from 'axios';
import {defineStore} from "pinia"
import {queryFormatter} from '../helpers/queryFormatter';

interface State {
    token: string | null,
}

const mutations = {
    UPDATE_TOKEN(state, payload) {
        localStorage.setItem('token', payload);
        state.token = payload;
    },
}

const actions = {
    register({commit}, payload) {
        return axios({
            method: 'POST',
            url: '/api/auth/register',
            data: queryFormatter(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            commit('UPDATE_TOKEN', response.data.token);
        });
    },
    changePassword(payload) {
        return axios({
            method: 'POST',
            url: '/api/auth/change-password',
            data: queryFormatter(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            commit('UPDATE_TOKEN', response.data.token);
        });
    },
    requestNewPassword({commit}, payload) {
        return axios({
            method: 'POST',
            url: '/api/auth/request-new-password',
            data: queryFormatter(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
    },
    restorePassword({commit}, payload) {
        return axios({
            method: 'POST',
            url: '/api/auth/restore-password',
            data: queryFormatter(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            commit('UPDATE_TOKEN', response.data.token);
        });
    },
    generateNewToken({commit}, payload) {
        return axios({
            method: 'POST',
            url: '/api/auth/generate-new-token',
            data: queryFormatter(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            commit('UPDATE_TOKEN', response.data.token);
        });
    },
    login({commit}, payload) {
        return axios({
            method: 'POST',
            url: '/api/login',
            data: queryFormatter(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            commit('UPDATE_TOKEN', response.data.token);
        });
    },
    getToken({commit}) {
        const token = localStorage.getItem('token');
        if (token) {
            commit('UPDATE_TOKEN', token);
        }
    },
    logout({commit}) {
        commit('UPDATE_TOKEN', null);
        localStorage.removeItem('token');
    },
}

const getters = {
    token: state => state.token,
}

export const useAuthStore = defineStore('authStore', {
    state: (): State => ({
        token: null,
    }),
    getters: getters,
    actions: actions,
})