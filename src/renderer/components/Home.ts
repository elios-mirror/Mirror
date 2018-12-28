import Vue from "vue";
import SocketService from "../../main/services/utils/socket.service";
import ModuleService, { IModule } from "../../main/services/module/module.service";

const Handlebars = require('handlebars');

export default Vue.extend({
    name: "home-page",
    data() {
        return {
            modules: [] as any
        };
    },
    methods: {},
    mounted() {
        const socketService = this.$container.get<SocketService>(SocketService.name);
        const moduleService = this.$container.get<ModuleService>(ModuleService.name);

        const sub = socketService.on('reload').subscribe(() => {
            sub.unsubscribe();
            this.$router.push('/loading');
        });

        const modules = moduleService.getAll();
        for (let moduleName in modules) {
            const module = modules[moduleName] as IModule;
            module.start();
        }

        setInterval(() => {
            this.modules = [];
            const modules = moduleService.getAll();
            for (let moduleName in modules) {
                const module = modules[moduleName] as IModule;
                const template = Handlebars.compile(module.template);
                this.modules.push(template(module.data));
            }
        }, 100);
        console.log(modules);

    }
});