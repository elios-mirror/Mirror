import Vue from "vue";
import SocketService from "../../main/services/utils/socket.service";
import ModuleService from "../../main/services/module/module.service";

export default Vue.extend({
    name: "home-page",
    data() {
        return {
            modules: [] as any
        };
    },
    methods: {},
    created() {
        const socketService = this.$container.get<SocketService>(SocketService.name);
        const moduleService = this.$container.get<ModuleService>(ModuleService.name);

        const sub = socketService.on('reload').subscribe(() => {
            sub.unsubscribe();
            this.$router.push('/loading');
        });

        console.log(moduleService.getAll());

        this.modules.push(require('./Layouts/Module').default);
        this.modules.push(moduleService.get('module-template', 'dev').vue);
    }
});