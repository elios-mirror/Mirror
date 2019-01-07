import "reflect-metadata";
import { remote } from 'electron';
import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import './themes/dark.scss';
import SocketService from "../main/services/utils/socket.service";
import Di from "../main/di";
import AccountService from "../main/services/api/account/account.service";
import SocketIoService from '../main/services/utils/socket-io.service';
import { MirrorDTO, ModuleVersionDTO } from '../main/services/api/mirror/mirror.service';
import UserDTO from "../main/services/api/account/user/user.dto";
import CookieService from '../main/services/utils/cookie.service';
import ModuleService from "../main/services/module/module.service";

const Buefy = require('buefy');
const VueQrcode = require('@xkeshi/vue-qrcode');

const container = remote.getGlobal('container') as Di;

Vue.component(VueQrcode.name, VueQrcode);

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
    components: { App },
    router,
    store,
    render(createElement: any) {
        return createElement(App);
    }
} as any);


vm.$mount("#app");

interface ModuleSocketDTO {
    action: string;
    mirror: MirrorDTO;
    user: UserDTO;
    module: ModuleVersionDTO;
}


const socketService = container.get<SocketService>(SocketService.name);
const moduleService = container.get<ModuleService>(ModuleService.name);
const accountService = container.get<AccountService>(AccountService.name);
const socketIoService = container.get<SocketIoService>(SocketIoService.name);
const cookieService = container.get<CookieService>(CookieService.name);
const mirrorId = cookieService.get('id');

socketService.on('accounts.login').subscribe(() => {
    vm.$router.push('/auth');
});

socketService.on('app.reload').subscribe(() => {
    vm.$router.push('/loading');
});

socketIoService.socket.on(`module_${mirrorId}`, (data: ModuleSocketDTO) => {
    if (data.action === 'install') {
        console.log('install module', data.module);
        // accountService.loadModules();
        moduleService.install({
            commit: data.module.commit,
            repository: data.module.module.repository,
            installId: data.module.link.id,
            version: data.module.version
        }).then((module) => {
            console.log('done');
        });
    } else if (data.action === 'uninstall') {
        console.log('unistall module', data.module);
        accountService.loadModules();
    }
});

accountService.isAuthenticated().subscribe((isAuth) => {
    if (isAuth) {
        vm.$router.push('/loading');
    } else {
        vm.$router.push('/auth');
    }
})

/**
 * Prevent drop file on window
 */
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

