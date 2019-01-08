import Vue from "vue";
import ModuleService, { IModule } from "../../main/services/module/module.service";
import '@dattn/dnd-grid/dist/dnd-grid.css';
import SocketService from '../../main/services/utils/socket.service';
import Elios from "../../main/elios/elios.controller";
const { Container, Box } = require('@dattn/dnd-grid');

interface WidgetBox {
  hidden: boolean;
  id: string;
  pinned: false;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  }
}

export default Vue.extend({
  name: "home-page",
  components: {
    DndGridContainer: Container,
    DndGridBox: Box
  },
  data() {
    return {
      modulesSubscribe: null as any,
      widgetsSubscribe: null as any,
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
      layout: [] as WidgetBox[],
      oldLayout: new Map<string, WidgetBox>()
    };
  },
  mounted() {
    const moduleService = this.$container.get<ModuleService>(ModuleService.name);
    const socketService = this.$container.get<SocketService>(SocketService.name);
    const elios = this.$container.get<Elios>(Elios.name);
    this.widgetsSubscribe = elios.getWidgetsSubject().subscribe((widget) => {
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
      } as WidgetBox);
      this.$set(this.widgets, widget.id, '')
      this.widgetObservers.push(widget.html.subscribe((html: string) => {
        this.$set(this.widgets, widget.id, html);
      }));
    });

    const modules = moduleService.getAll();
    for (let moduleInstallId in modules) {
      const module = modules[moduleInstallId] as IModule;
      module.start();
    }

    socketService.on('modules.install.end').subscribe((data: any) => {
      if (data.success) {
        data.module.start();
      }
    });
  },
  methods: {
    onBoxDragEnd(evt: any) {
      this.layout.forEach((item: WidgetBox) => {
        let old = this.oldLayout.get(item.id) as WidgetBox;

        if (old != null) {
          if (item.id != old.id
            || item.hidden != old.hidden
            || item.pinned != old.pinned
            || item.position.x != old.position.x
            || item.position.y != old.position.y
            || item.position.w != old.position.w
            || item.position.h != old.position.h) {
            this.oldLayout.set(item.id, item);
            console.log(item);
          }
        }
        else // TODO: Remove this
          this.oldLayout.set(item.id, item);
      });
    },

    beforeDestroy() {
      this.widgetsSubscribe.unsubscribe();
      this.widgetObservers.forEach(widgetOberver => widgetOberver.unsubscribe());
      const moduleService = this.$container.get<ModuleService>(ModuleService.name);

      const modules = moduleService.getAll();
      for (let moduleInstallId in modules) {
        const module = modules[moduleInstallId] as IModule;
        module.stop();
      }
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
      } as WidgetBox);
      this.$set(this.widgets, widget.id, '')
      this.widgetObservers.push(widget.html.subscribe((html: string) => {
        this.$set(this.widgets, widget.id, html)
      }));
    },

    widgetsBoxToJson(newVal: WidgetBox) {
      return {
        id: newVal.id,
        hidden: newVal.hidden,
        pinned: newVal.pinned,
        position: {
          x: newVal.position.x,
          y: newVal.position.y,
          w: newVal.position.w,
          h: newVal.position.h
        }
      };
    }
  }
});