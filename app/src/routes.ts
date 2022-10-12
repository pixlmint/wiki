import {createRouter, createWebHistory} from 'vue-router';

import WikiEntry from "@/src/components/home/WikiEntry.vue";
import Login from "./components/auth/Login.vue";
import LoginRedirector from "./components/auth/LoginRedirector.vue";
import RestorePassword from "./components/auth/RestorePassword.vue";
import RequestNewPassword from "./components/auth/RequestNewPassword.vue";
import ChangePassword from "./components/auth/ChangePassword.vue";
import Register from "./components/auth/Register.vue";
import GenerateNewToken from "./components/auth/GenerateNewToken.vue";
import CreateAdmin from "./components/auth/CreateAdmin.vue";
import Auth from "./components/auth/Auth.vue";
import Editor from "./components/admin/Editor/Editor.vue";
import AdminTools from './components/admin/Tools/index.vue';

const routes = [
    {
        path: '/auth',
        name: "Auth",
        component: Auth,
    },
    {
        path: '/auth/login',
        name: "Login",
        component: Login,
    },
    {
        path: '/auth/login-if-not-logged-in',
        name: 'Login if not logged in',
        component: LoginRedirector,
    },
    {
        path: '/auth/register',
        name: "Register",
        component: Register,
    },
    {
        path: '/auth/restore-password',
        name: "Restore Password",
        component: RestorePassword,
    },
    {
        path: '/auth/request-new-password',
        name: "Request New Password",
        component: RequestNewPassword,
    },
    {
        path: '/auth/change-password',
        name: "Change Password",
        component: ChangePassword,
    },
    {
        path: '/auth/generate-new-token',
        name: "Generate New Token",
        component: GenerateNewToken,
    },
    {
        path: '/auth/create-admin',
        name: "Create Admin User",
        component: CreateAdmin,
    },
    {
        path: "/admin/tools",
        name: "More Tools",
        component: AdminTools,
    },
    {
        path: '/:pathMatch(.*)*',
        name: "Home",
        component: WikiEntry,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;
