import {createApp} from "vue";
import App from './App.vue'
import router from "./src/routes"
import VueAxios from 'vue-axios'
import axios from 'axios'
import {createPinia} from "pinia"
import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import Prism from 'prismjs';
import enUS from '@kangc/v-md-editor/lib/lang/en-US';

VueMarkdownEditor.use(vuepressTheme, {
    Prism,
})
VueMarkdownEditor.lang.use('en-US', enUS)

createApp(App).use(VueMarkdownEditor).use(VueAxios, axios).use(createPinia()).use(router).mount('#app')
