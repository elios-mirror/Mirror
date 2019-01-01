import Vue from "vue";
import ModuleService, { IModule } from "../../main/services/module/module.service";
import '@dattn/dnd-grid/dist/dnd-grid.css';
import SocketService from '../../main/services/utils/socket.service';

const { Container, Box } = require('@dattn/dnd-grid');
const Handlebars = require('handlebars');


export default Vue.extend({
    name: "home-page",
    components: {
        DndGridContainer: Container,
        DndGridBox: Box
    },
    data() {
        return {
            it: null as any,
            modulesSubscribe: null as any,
            modules: [] as any,
            cellSize: {
                w: 25,
                h: 25
            },
            maxColumnCount: 68,
            maxRowCount: 37,
            bubbleUp: false,
            margin: 3,
            layout: []
        };
    },
    mounted() {
        const moduleService = this.$container.get<ModuleService>(ModuleService.name);
        const socketService = this.$container.get<SocketService>(SocketService.name);

        const modules = moduleService.getAll();
        for (let moduleInstallId in modules) {
            const module = modules[moduleInstallId] as IModule;
            this.layout.push({
                id: moduleInstallId,
                hidden: false,
                pinned: false,
                position: {
                    x: 0,
                    y: 0,
                    w: 8,
                    h: 6
                }
            } as never);
            module.start();
        }

        this.it = setInterval(() => {
            this.modules = [];
            for (let moduleName in modules) {
                const module = modules[moduleName] as IModule;
                const template = Handlebars.compile(module.template);
                module.html = template(module.data);
                this.modules.push(module);
            }
        }, 100);


        socketService.on('modules.install.end').subscribe((data) => {
            if (data.success) {
                modules[data.module.installId] = data.module
                this.layout.push({
                    id: data.module.installId,
                    hidden: false,
                    pinned: false,
                    position: {
                        x: 0,
                        y: 0,
                        w: 8,
                        h: 6
                    }
                } as never);
                data.module.start();
            }
        });

    },
    beforeDestroy() {
        clearInterval(this.it);
    },
    methods: {
        onLayoutUpdate(evt: any) {
            this.layout = evt.layout
        }
    }
});