import {defineStore} from "pinia"
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
        setToken(token: string) {
            this.token = token;
            localStorage.setItem('token', token);
        },
        haveEditRights() {
            return this.token !== null;
        },
        haveViewRights() {
            return this.haveEditRights();
        },
        haveDeleteRights() {
            return this.haveEditRights();
        },
        changePassword(payload: ChangePasswordForm) {
            const request = buildRequest('/api/auth/change-password', payload, 'POST');
            return send(request).then(response => {
                this.setToken(response.data.token);
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
                this.setToken(response.data.token);
            })
        },
        generateNewToken(username: string) {
            const request = buildRequest('/api/auth/generate-new-token', {username: username}, 'POST');
            return send(request).then(response => {
                this.setToken(response.data.token);
            });
        },
        login(data: object) {
            const request = buildRequest('/api/auth/login', data, 'POST');
            return send(request).then(response => {
                this.setToken(response.data.token);
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
        createAdmin(data: object) {
            const request = buildRequest('/api/auth/create-admin', data, 'POST');
            return send(request);
        },
    },
})