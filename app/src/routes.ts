import {createRouter, createWebHistory} from 'vue-router';

import WikiEntry from "@/src/components/home/WikiEntry.vue";
import Editor from "./components/admin/Editor/Editor.vue";
import Board from "./components/kanban/board.vue";

const routes = [
    {
        path: '/',
        name: "Home",
        component: WikiEntry,
    },
    {
        path: '/board',
        name: "Board",
        component: Board,
    },
    {
        path: '/admin/edit',
        name: 'Edit',
        component: Editor,
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
