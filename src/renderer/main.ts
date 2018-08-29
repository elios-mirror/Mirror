import "reflect-metadata";
import {remote} from 'electron';
import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import './themes/dark.scss';

const Buefy  = require('buefy');
const VueQrcode = require('@xkeshi/vue-qrcode');

const container = remote.getGlobal('container');

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.config.productionTip = false;

Object.defineProperties(Vue.prototype, {
    $container: {
        get: () => {
            return container;
        }
    }
});

Vue.use(Buefy.default, { defaultIconPack: 'far' });


Vue.component(VueQrcode.name, VueQrcode);


/* eslint-disable no-new */
const vm = new Vue({
    components: {App},
    router,
    store,
    render(createElement: any) {
        return createElement(App);
    }
} as any);


vm.$mount("#app");
/**
 * Prevent drop file on window
 */
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

