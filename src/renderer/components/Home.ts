import Vue from "vue";
import ModuleService, { IModule } from "../../main/services/module/module.service";
import '@dattn/dnd-grid/dist/dnd-grid.css';
import SocketService from '../../main/services/utils/socket.service';
import Elios from "../../main/elios/elios.controller";
import { EliosWidget } from "../../main/elios/interfaces/elios.interface";

const { Container, Box } = require('@dattn/dnd-grid');

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
            cellSize: {
                w: 25,
                h: 25
            },
            maxColumnCount: 68,
            maxRowCount: 37,
            bubbleUp: false,
            margin: 3,
            widgetObservers: [] as any[],
            widgets: [] as any[],
            layout: []
        };
    },
    mounted() {
        const moduleService = this.$container.get<ModuleService>(ModuleService.name);
        const socketService = this.$container.get<SocketService>(SocketService.name);
        const elios = this.$container.get<Elios>(Elios.name);


        const modules = moduleService.getAll();
        for (let moduleInstallId in modules) {
            const module = modules[moduleInstallId] as IModule;
            module.start();
        }

        const widgets = elios.getWidgets();
        widgets.forEach((widget) => {
            this.layout.push({
                id: widget.id,
                hidden: false,
                pinned: false,
                position: {
                    x: 0,
                    y: 0,
                    w: 8,
                    h: 6
                }
            } as never);

            let index = this.widgets.push({
                html: '',
                id: widget.id
            });
            this.widgetObservers.push(widget.html.subscribe((html) => {
                this.widgets = this.widgets.splice(index - 1, 1);
                index = this.widgets.push({
                    html: html,
                    id: widget.id
                });
            }));

        })

        // socketService.on('modules.install.end').subscribe((data: any) => {
        //     if (data.success) {
        //         modules[data.module.installId] = data.module
        //         this.layout.push({
        //             id: data.module.installId,
        //             hidden: false,
        //             pinned: false,
        //             position: {
        //                 x: 0,
        //                 y: 0,
        //                 w: 8,
        //                 h: 6
        //             }
        //         } as never);
        //         data.module.start();
        //     }
        // }); // TODO: Add new module system 

    },
    beforeDestroy() {
        clearInterval(this.it);
        this.widgetObservers.forEach(widgetOberver => widgetOberver.unsubscribe());
    },
    methods: {
        onLayoutUpdate(evt: any) {
            this.layout = evt.layout
        }
    }
});