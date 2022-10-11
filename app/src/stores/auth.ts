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

interface RestorePasswordForm {
    username: string,
    newPassword1: string,
    newPassword2: string,
    token: string,
}

interface GenerateNewTokenForm {
    username: string,
    token: string,
}

interface LoginForm {
    username: string,
    password: string,
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
        restorePassword(payload: RestorePasswordForm) {
            return axios({
                method: 'POST',
                url: '/api/auth/restore-password',
                data: queryFormatter(payload),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.$state.token = response.data.token;
            });
        },
        generateNewToken(payload: GenerateNewTokenForm) {
            return axios({
                method: 'POST',
                url: '/api/auth/generate-new-token',
                data: queryFormatter(payload),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.$state.token = response.data.token;
            });
        },
        login(loginForm: LoginForm) {
            return axios({
                method: 'POST',
                url: '/api/login',
                data: queryFormatter(loginForm),
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
        createAdmin(userForm: LoginForm) {
            return axios({
                method: "POST",
                url: '/api/auth/create-admin',
                data: queryFormatter(userForm),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            })
        },
    },
})