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
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import PWNav from '@/src/components/pw/nav.vue';
import PWLoading from '@/src/components/pw/loading.vue';
import PWSearch from '@/src/components/pw/search.vue';

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
})
VueMarkdownEditor.lang.use('en-US', enUS)

const app = createApp(App)
app.use(VueMarkdownEditor)
app.use(VueAxios, axios)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.component('pw-nav', PWNav);
app.component('pw-loading', PWLoading);
app.component('pw-search', PWSearch);

app.mount('#app')