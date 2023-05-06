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
        path: '/',
        name: "Home",
        component: WikiEntry,
    },
    {
        path: '/:pathMatch(.*)*',
        name: "WikiEntry",
        component: WikiEntry,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;
