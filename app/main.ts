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
import VueDiff from 'vue-diff';
import {main, Dialog, Icon} from "pixlcms-wrapper";
import {library} from "@fortawesome/fontawesome-svg-core";
import {
    faArrowRotateRight,
    faBug, faCircle,
    faEraser,
    faHand,
    faHighlighter,
    faPencil,
    faPenRuler,
    faSave,
    faVectorSquare, faTimes
} from "@fortawesome/free-solid-svg-icons";

const pinia = createPinia();

const app = createApp(App)
app.use(VueAxios, axios)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(VueDiff)
app.use(main, {pinia});

app.component('pw-nav', PWNav);
app.component('pw-loading', PWLoading);
app.component('pw-search', PWSearch);
app.component('pw-md-editor', PWMDEditor);
app.component('pm-dialog', Dialog);
app.component('pm-icon', Icon);

library.add(faEraser, faPencil, faHighlighter, faSave, faPenRuler, faBug, faHand, faVectorSquare, faCircle, faArrowRotateRight, faTimes);

app.mount('#app')