import Vue from "vue";
import SocketService from "../../main/services/utils/socket.service";
import ModuleService, { IModule } from "../../main/services/module/module.service";
import SocketIoService from "../../main/services/utils/socket-io.service";
import { MirrorDTO, ModuleVersionDTO } from '../../main/services/api/mirror/mirror.service';
import CookieService from '../../main/services/utils/cookie.service';
import UserDTO from '../../main/services/api/account/user/user.dto';

const Handlebars = require('handlebars');

interface ModuleSocketDTO {
    action: string;
    mirror: MirrorDTO;
    user: UserDTO;
    module: ModuleVersionDTO;
}

export default Vue.extend({
    name: "home-page",
    data() {
        return {
            mirrorId: '' as string,
            modules: [] as any
        };
    },
    methods: {},
    mounted() {
        const socketService = this.$container.get<SocketService>(SocketService.name);
        const moduleService = this.$container.get<ModuleService>(ModuleService.name);
        const cookieService = this.$container.get<CookieService>(CookieService.name);
        const socketIoService = this.$container.get<SocketIoService>(SocketIoService.name);
        
        this.mirrorId = cookieService.get('id')

        const modules = moduleService.getAll();
        for (let moduleName in modules) {
            const module = modules[moduleName] as IModule;
            module.start();
        }

        const it = setInterval(() => {
            this.modules = [];
            const modules = moduleService.getAll();
            for (let moduleName in modules) {
                const module = modules[moduleName] as IModule;
                const template = Handlebars.compile(module.template);
                this.modules.push(template(module.data));
            }
        }, 100);

        const sub = socketService.on('reload').subscribe(() => {
            clearInterval(it);
            sub.unsubscribe();
            this.$router.push('/loading');
        });

        socketIoService.socket.on(`module_${this.mirrorId}`, (data: ModuleSocketDTO) => {
            clearInterval(it);
            sub.unsubscribe();
            this.$router.push('/loading');
        });

    }
});