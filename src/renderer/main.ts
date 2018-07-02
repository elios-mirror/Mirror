import "reflect-metadata";
import {remote} from 'electron';
import App from "./App.vue";
import Vue from "vue";
import router from "./router";
import store from "./store";
import Buefy from 'buefy';

import './themes/dark.scss';

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

Vue.use(Buefy);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  render(createElement: any) {
    return createElement(App);
  }
} as any).$mount("#app");

document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

