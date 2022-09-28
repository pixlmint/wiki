import Vue from 'vue';
import Vuex from 'vuex';

// Module
import months from "./modules/months/";
import auth from "./modules/auth/";
import main from "./modules/main/";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        main,
        months,
        auth,
    }
})