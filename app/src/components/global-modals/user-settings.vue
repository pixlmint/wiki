<template>
    <pm-dialog class="user-settings-popup" title="Settings" :route="route">
        <el-form v-model="settings">
            <el-form-item label="Auto save">
                <el-switch v-model="settings.autoSave"/>
            </el-form-item>
            <el-form-item label="Theme">
                <el-radio-group v-model="settings.theme">
                    <el-radio label="dark">
                        <pm-icon icon="moon"></pm-icon>
                    </el-radio>
                    <el-radio label="light">
                        <pm-icon icon="sun"></pm-icon>
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Build Index">
                <el-button @click="rebuildIndex"><pm-icon icon="rotate"></pm-icon></el-button>
            </el-form-item>
            <el-form-item label="Download Backup">
                <el-button @click="downloadBackup"><pm-icon icon="download"></pm-icon></el-button>
            </el-form-item>
            <el-button @click="reloadNav">Reload Nav</el-button>
        </el-form>
        <template #footer>
            <el-button text @click="showVersionsPopup">PixlWiki Version {{ version }}</el-button>
            |
            <el-button text @click="logout">Logout</el-button>
        </template>
    </pm-dialog>
</template>

<script lang="ts">
import {defineComponent, h, watch} from "vue";
import {useUserSettings} from "@/src/stores/user-settings";
import {useMainStore} from "@/src/stores/main";
import {ElMessageBox, ElNotification} from "element-plus";
import {useAuthStore} from "pixlcms-wrapper";
import {useWikiStore} from "@/src/stores/wiki";

export const route = '/settings';

export default defineComponent({
    name: "UserSettings",
    data() {
        return {
            userSettings: useUserSettings(),
            wikiStore: useWikiStore(),
            settings: useUserSettings().getSettings,
            route: route,
        }
    },
    created() {
        watch(this.settings, (value) => {
            this.userSettings.updateSettings(value);
            this.setTheme(value.theme);
        });
    },
    computed: {
        version() {
            return useMainStore().meta.frontendVersion;
        },
    },
    methods: {
        downloadBackup() {
            this.userSettings.downloadBackup();
        },
        rebuildIndex() {
            useWikiStore().rebuildIndex().then(response => {
                ElNotification({
                    title: 'Rebuild Index',
                    message: 'Built in ' + Math.round(response.data.indexTime * 1000) + "ms",
                });
            })
        },
        logout() {
            useAuthStore().logout();
            useWikiStore().loadNav();
        },
        setTheme(theme: string) {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add(theme);
        },
        reloadNav() {
            this.wikiStore.loadNav(true);
        },
        showVersionsPopup() {
            ElMessageBox({
                title: 'Version Information',
                message: h('ul', null, [
                    h('li', null, 'Plugin Version: '+ useMainStore().meta.pluginVersion),
                    h('li', null, 'CMS Version: '+ useMainStore().meta.cmsVersion),
                    h('li', null, 'Frontend Version: '+ useMainStore().meta.frontendVersion),
                ]),
            })
        },
    },
})
</script>

<style lang="scss">
.user-settings-popup footer {
    width: 100%;
    text-align: center;
    color: grey;
    font-style: italic;
    font-size: 0.8rem;
}
</style>