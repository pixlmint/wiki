import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import MonthList from "./components/home/MonthList";
import Login from "./components/auth/Login";
import LoginRedirector from "./components/auth/LoginRedirector";
import RestorePassword from "./components/auth/RestorePassword";
import RequestNewPassword from "./components/auth/RequestNewPassword";
import ChangePassword from "./components/auth/ChangePassword";
import Register from "./components/auth/Register";
import GenerateNewToken from "./components/auth/GenerateNewToken";
import CreateAdmin from "./components/auth/CreateAdmin";
import Auth from "./components/auth/Auth";
import Editor from "./components/admin/Editor/Editor";
import NotFound from './components/error/NotFound';
import AdminTools from './components/admin/Tools/index';

const routes = [
    {
        path: '/',
        name: "Home",
        component: MonthList,
    },
    {
        path: '/edit',
        name: "Edit",
        props: route => ({ entry: route.query.entry }),
        component: Editor,
    },
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
        path: "*",
        name: "notFound",
        component: NotFound,
    }
];

export const router = new VueRouter({
    mode: 'history',
    routes,
})