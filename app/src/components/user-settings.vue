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
        </el-form>
        <template #footer>
            PixlWiki Version {{ version }}
        </template>
    </el-dialog>
</template>

<script lang="ts">
import {defineComponent, watch} from "vue";
import {useDialogStore} from "@/src/stores/dialog";
import {useUserSettings} from "@/src/stores/user-settings";
import {useMainStore} from "@/src/stores/main";
import {Sunny, Moon} from "@element-plus/icons-vue";

const route = '/settings';

export default defineComponent({
    components: {
        Moon, Sunny,
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
            return useMainStore().meta.version;
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
        setTheme(theme: string) {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add(theme);
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