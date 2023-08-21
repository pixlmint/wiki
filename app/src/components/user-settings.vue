<template>
    <el-dialog class="user-settings-popup" title="Settings" v-model="isShowing">
        <el-form v-model="settings">
            <el-form-item label="Auto save">
                <el-switch v-model="settings.autoSave"/>
            </el-form-item>
            <el-form-item label="Theme">
                <el-radio-group v-model="settings.theme">
                    <el-radio label="dark">
                        <el-icon>
                            <Moon/>
                        </el-icon>
                    </el-radio>
                    <el-radio label="light">
                        <el-icon>
                            <Sunny/>
                        </el-icon>
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Build Index">
                <el-button @click="rebuildIndex"><el-icon><Refresh/></el-icon></el-button>
            </el-form-item>
            <el-form-item label="Download Backup">
                <el-button @click="downloadBackup"><arrow-down></arrow-down></el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            PixlWiki Version <span @click="showVersionsPopup">{{ version }}</span>
            |
            <span @click="logout">Logout</span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import {defineComponent, h, watch} from "vue";
import {useDialogStore} from "@/src/stores/dialog";
import {useUserSettings} from "@/src/stores/user-settings";
import {useMainStore} from "@/src/stores/main";
import {Sunny, Moon, Refresh, ArrowDown} from "@element-plus/icons-vue";
import {ElMessageBox, ElNotification} from "element-plus";
import {useAuthStore} from "@/src/stores/auth";
import {useWikiStore} from "@/src/stores/wiki";

const route = '/settings';

export default defineComponent({
    components: {
        Moon, Sunny, Refresh, ArrowDown,
    },
    data() {
        return {
            dialogStore: useDialogStore(),
            userSettings: useUserSettings(),
            settings: useUserSettings().getSettings,
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
        isShowing: {
            get() {
                return route === this.dialogStore.getShowingDialog;
            },
            set() {
                this.dialogStore.clearShowingDialog();
            }
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