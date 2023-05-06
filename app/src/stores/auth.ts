import axios from 'axios';
import {defineStore} from "pinia"
import {queryFormatter} from '../helpers/queryFormatter';
import {buildRequest, send} from "@/src/helpers/xhr";

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
        getToken: (state) => state.token,
    },
    actions: {
        changePassword(payload: ChangePasswordForm) {
            const request = buildRequest('/api/auth/change-password', payload, 'POST');
            return send(request).then(response => {
                this.token = response.data.token;
            })
        },
        requestNewPassword(username: string) {
            const request = buildRequest('/api/auth/request-new-password', {username: username}, 'POST');
            return send(request);
        },
        restorePassword(username: string, password1: string, password2: string, token: string | null) {
            if (token === null) {
                throw new Error('invalid token');
            }
            const data = {
                username: username,
                password1: password1,
                password2: password2,
                token: token,
            };
            const request = buildRequest('/api/auth/restore-password', data, 'POST');
            return send(request).then(response => {
                this.token = response.data.token;
            })
        },
        generateNewToken(username: string, token: string | null) {
            if (token === null) {
                throw new Error('invalid token');
            }
            const data = {
                username: username,
                token: token,
            };
            const request = buildRequest('/api/auth/generate-new-token', data, 'POST');
            return send(request).then(response => {
                this.token = response.data.token;
            });
        },
        login(username: string, password: string) {
            const data = {
                username: username,
                password: password,
            };
            const request = buildRequest('/api/login', data, 'POST');
            return send(request).then(response => {
                this.token = response.data.token;
            });
        },
        loadToken() {
            const token = localStorage.getItem('token');
            if (token) {
                this.token = token;
            }
        },
        logout() {
            this.token = null;
            localStorage.removeItem('token');
        },
        createAdmin(username: string, password: string) {
            const data = {
                username: username,
                password: password,
            };
            const request = buildRequest('/api/auth/create-admin', data, 'POST');
            return send(request);
        },
    },
})