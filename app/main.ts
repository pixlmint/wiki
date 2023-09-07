import {createApp} from "vue";
import App from './App.vue'
import router from "./src/routes"
import VueAxios from 'vue-axios'
import axios from 'axios'
import {createPinia} from "pinia"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import PWNav from '@/src/components/pw/nav.vue';
import PWLoading from '@/src/components/pw/loading.vue';
import PWSearch from '@/src/components/pw/search.vue';
import PWMDEditor from '@/src/components/pw/md-editor.vue';

const app = createApp(App)
app.use(VueAxios, axios)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.component('pw-nav', PWNav);
app.component('pw-loading', PWLoading);
app.component('pw-search', PWSearch);
app.component('pw-md-editor', PWMDEditor);

app.mount('#app')