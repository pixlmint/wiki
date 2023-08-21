import {defineStore} from "pinia";
import {buildRequest, send} from "@/src/helpers/xhr";

interface Settings {
    autoSave: boolean,
    theme: string,
}

interface State {
    settings: Settings,
}

export const useUserSettings = defineStore('userSettings', {
    state: (): State => ({
        settings: {
            autoSave: true,
            theme: 'light',
        }
    }),
    getters: {
        getSettings: state => state.settings,
    },
    actions: {
        loadUserSettings() {
            const storedUserSettingsString = localStorage.getItem('userSettings');
            if (storedUserSettingsString === null) {
                return this.settings;
            }
            this.settings = JSON.parse(storedUserSettingsString);
            this.setCurrentTheme(this.settings.theme);
            return this.settings;
        },
        updateSettings(settings: Settings) {
            this.settings = settings;
            localStorage.setItem('userSettings', JSON.stringify(settings));
        },
        downloadBackup() {
            const request = buildRequest('/api/admin/generate-backup');
            send(request).then(response => {
                location.href = response.data.file;
            });
        },
        setCurrentTheme(theme: string) {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add(this.settings.theme);
        },
    },
})