<template>
    <pm-dialog class="user-settings-popup" title="Settings" :route="route">
        <el-form v-model="settings">
            <el-tabs tab-position="left">
                <el-tab-pane label="User">
                    <el-form-item label="Auto save">
                        <el-switch v-model="settings.autoSave"/>
                    </el-form-item>
                    <el-form-item label="Theme">
                        <el-radio-group v-model="settings.theme">
                            <el-radio value="dark">
                                <pm-icon icon="moon"></pm-icon>
                            </el-radio>
                            <el-radio value="light">
                                <pm-icon icon="sun"></pm-icon>
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="Security">
                    <el-button @click="changePassword">Change Password</el-button>
                </el-tab-pane>
                <el-tab-pane label="Admin">
                    <el-form-item label="Build Index">
                        <el-button @click="rebuildIndex"><pm-icon icon="rotate"></pm-icon></el-button>
                    </el-form-item>
                    <el-form-item label="Download Backup">
                        <el-button @click="downloadBackup"><pm-icon icon="download"></pm-icon></el-button>
                    </el-form-item>
                    <el-button @click="reloadNav">Reload Nav</el-button>
                    <el-button @click="dumpAlternateContent">Dump Alternate Content into files</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
        <template #footer>
            <el-button @click="showVersionsPopup">PixlWiki Version {{ version }}</el-button>
            |
            <el-dropdown split-button @click="logout">
                Logout
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="logoutEverywhere">Logout Everywhere</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </template>
    </pm-dialog>
</template>

<script lang="ts">
import {defineComponent, h, watch} from "vue";
import {useUserSettings} from "@/src/stores/user-settings";
import {useMainStore} from "@/src/stores/main";
import {ElMessageBox, ElNotification} from "element-plus";
import {useAuthStore, useDialogStore} from "pixlcms-wrapper";
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
            dialogStore: useDialogStore(),
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
        logoutEverywhere() {
            useAuthStore().logout(true);
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
        changePassword() {
            this.dialogStore.showDialog('/auth/change-password');
        },
        dumpAlternateContent() {
            useWikiStore().dumpAlternateContent().then(response => {
                ElNotification({
                    title: "Dumped alternate content",
                });
            });
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
