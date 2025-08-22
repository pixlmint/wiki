import {createApp} from "vue";
import App from './App.vue'
import VueAxios from 'vue-axios'
import axios from 'axios'
import {createPinia} from "pinia"
import ElementPlus from 'element-plus'
import PWNav from '@/src/components/pw/nav/nav.vue';
import PWLoading from '@/src/components/pw/loading.vue';
import PWSearch from '@/src/components/pw/search.vue';
import PWMDEditor from '@/src/components/pw/md-editor.vue';
import ViewPage from '@/src/components/pw/view-page.vue';
import Highlighting from '@/src/components/pw/highlighting.vue';
import NavEntryTitle from '@/src/components/pw/nav/nav-entry-title.vue';
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
    faVectorSquare, faTimes, faPlus, faFolderPlus, faFilePdf, faFileCirclePlus, faLock, faUnlock,
    faPen, faPenToSquare, faTrash, faEllipsis, faCaretLeft, faCaretRight, faCaretDown, faHouse, faCirclePlus, faUser,
    faEye, faMoon, faSun, faDownload, faRotate, faGear, faUpload, faCheck, faXmark, faTable, faImage, faCopy,
    faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import {
    faTrello, faMarkdown
} from "@fortawesome/free-brands-svg-icons";

const pinia = createPinia();

const app = createApp(App)
app.use(VueAxios, axios)
app.use(pinia)
app.use(ElementPlus)
app.use(VueDiff)
app.use(main, {pinia});

app.component('pw-nav', PWNav);
app.component('pw-loading', PWLoading);
app.component('pw-search', PWSearch);
app.component('pw-md-editor', PWMDEditor);
app.component('pm-dialog', Dialog);
app.component('pm-icon', Icon);
app.component('pw-view-page', ViewPage);
app.component('pw-highlighting', Highlighting);
app.component('pw-nav-entry-title', NavEntryTitle);

library.add(faEraser, faPencil, faHighlighter, faSave, faPenRuler, faBug, faHand, faVectorSquare, faCircle,
    faArrowRotateRight, faTimes, faPlus, faTrello, faFolderPlus, faFilePdf, faFileCirclePlus, faLock, faUnlock,
    faPen, faPenToSquare, faTrash, faEllipsis, faCaretLeft, faCaretRight, faCaretDown, faHouse, faCirclePlus, faUser,
    faEye, faMoon, faSun, faDownload, faRotate, faGear, faUpload, faCheck, faXmark, faMarkdown, faTable, faImage,
    faCopy, faFileArrowDown);

app.mount('#app')
