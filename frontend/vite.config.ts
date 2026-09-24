import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ command }) => ({
    base: command === "build" ? "/dist/" : "/",

    plugins: [
        vue(),
        AutoImport({ resolvers: [ElementPlusResolver()] }),
        Components({ resolvers: [ElementPlusResolver()] }),
    ],

    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },

    server: {
        port: 8080,
        proxy: {
            "/api": "http://127.0.0.1:94",
            "/backup": "http://127.0.0.1:94",
            "/media": "http://127.0.0.1:94",
        },
    },

    build: {
        outDir: "../backend/dist",
        emptyOutDir: true,
    },
}));
