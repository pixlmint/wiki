import {createApp} from "vue";
import App from './App.vue'
import store from "./src/stores"
import {router} from "./src/routes"
import VueAxios from 'vue-axios'
import axios from 'axios'
import {createPinia} from "pinia"

createApp(App).use(VueAxios, axios).use(createPinia()).use(router).use(store).mount('#app')
