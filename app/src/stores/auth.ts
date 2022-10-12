import axios from 'axios';
import {defineStore} from "pinia"
import {queryFormatter} from '../helpers/queryFormatter';

interface State {
    token: string | null,
}

interface ChangePasswordForm {
    username: string,
    currentPassword: string,
    newPassword1: string,
    newPassword2: string,
}

export const useAuthStore = defineStore('authStore', {
    state: (): State => ({
        token: null,
    }),
    getters: {
        token: (state) => state.token,
    },
    actions: {
        changePassword(payload: ChangePasswordForm) {
            return axios({
                method: 'POST',
                url: '/api/auth/change-password',
                data: queryFormatter(payload),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.$state.token = response.data.token;
            });
        },
        requestNewPassword(username: string) {
            return axios({
                method: 'POST',
                url: '/api/auth/request-new-password',
                data: queryFormatter({username: username}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            });
        },
        restorePassword(username: string, password1: string, password2: string, token: string | null) {
            if (token === null) {
                throw new Error('invalid token');
            }
            return axios({
                method: 'POST',
                url: '/api/auth/restore-password',
                data: queryFormatter({
                    username: username,
                    password1: password1,
                    password2: password2,
                    token: token,
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.$state.token = response.data.token;
            });
        },
        generateNewToken(username: string, token: string | null) {
            if (token === null) {
                throw new Error('invalid token');
            }
            return axios({
                method: 'POST',
                url: '/api/auth/generate-new-token',
                data: queryFormatter({username: username, token: token}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.$state.token = response.data.token;
            });
        },
        login(username: string, password: string) {
            return axios({
                method: 'POST',
                url: '/api/login',
                data: queryFormatter({
                    username: username,
                    password: password,
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.$state.token = response.data.token;
            });
        },
        getToken() {
            const token = localStorage.getItem('token');
            if (token) {
                this.$state.token = token;
            }
        },
        logout() {
            this.$state.token = null;
            localStorage.removeItem('token');
        },
        createAdmin(username: string, password: string) {
            return axios({
                method: "POST",
                url: '/api/auth/create-admin',
                data: queryFormatter({
                    username: username,
                    password: password,
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            })
        },
    },
})