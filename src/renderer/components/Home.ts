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
            widgets: {} as any,
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
        this.layout = [];
        widgets.forEach((widget) => {
            this.addWidget(widget);
        });

        elios.getWidgetSubject().subscribe((widget) => {
            this.addWidget(widget);
        });
        

        socketService.on('modules.install.end').subscribe((data: any) => {
            if (data.success) {
                data.module.start();
            }
        });

    },
    beforeDestroy() {
        clearInterval(this.it);
        this.widgetObservers.forEach(widgetOberver => widgetOberver.unsubscribe());
        const moduleService = this.$container.get<ModuleService>(ModuleService.name);

        const modules = moduleService.getAll();
        for (let moduleInstallId in modules) {
            const module = modules[moduleInstallId] as IModule;
            module.stop();
        }

    },
    methods: {
        onLayoutUpdate(evt: any) {
            this.layout = evt.layout
        },
        addWidget(widget: any) {
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
            this.$set(this.widgets, widget.id, '')
            this.widgetObservers.push(widget.html.subscribe((html: string) => {
                this.$set(this.widgets, widget.id, html)
            }));
        }
    }
});