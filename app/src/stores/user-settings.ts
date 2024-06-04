import {defineStore} from "pinia";
import {buildRequest, send} from "pixlcms-wrapper";

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
            this.setCurrentTheme();
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
        setCurrentTheme() {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add(this.settings.theme);
            const existingStylesheet = document.getElementById('prism-stylesheet');
            if (existingStylesheet !== null) {
                existingStylesheet.remove()
            }
            const linkElement = document.createElement('link');
            linkElement.setAttribute('rel', 'stylesheet');
            linkElement.setAttribute('id', 'prism-stylesheet');
            let codeStylesheet = 'prism-material-dark.css';
            if (this.settings.theme === 'light') {
                codeStylesheet = 'prism-material-light.css';
            }
            linkElement.setAttribute('href', '/dist/assets/prismthemes/' + codeStylesheet);
            document.getElementsByTagName("head")[0].appendChild(linkElement);
        },
    },
})
