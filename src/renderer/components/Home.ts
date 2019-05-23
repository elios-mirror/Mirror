import Vue from "vue";
import ModuleService, { IModule } from "../../main/services/module/module.service";
import '@dattn/dnd-grid/dist/dnd-grid.css';
import SocketService from '../../main/services/utils/socket.service';
import Elios from "../../main/elios/elios.controller";
import MirrorService from "../../main/services/api/mirror/mirror.service";
import AccountService from "../../main/services/api/account/account.service";
const { Container, Box } = require('@dattn/dnd-grid');

interface WidgetsBox {
  [details: string]: WidgetBox;
}

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
      widgetObservers: new Map<string, any>(),
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
      const module = moduleService.get(widget.id) as any;
      if (module && module.installId === widget.id && module.settings) {
        this.setBothLayout(module.installId, JSON.parse(module.settings));
      } else {
        this.setBothLayout(module.installId, {
          hidden: false,
          id: widget.id,
          pinned: false,
          position: {
            x: 0,
            y: 0,
            w: 8,
            h: 6
          }
        });
      }
      this.$set(this.widgets, widget.id, '')
      this.widgetObservers.set(widget.id, widget.html.subscribe((html: string) => {
        this.$set(this.widgets, widget.id, html);
      }));
    });
    
    moduleService.startAllApps();

    socketService.on('modules.install.end').subscribe((data: any) => {
      if (data.success) {
        console.log('New module from socket');
      }
    });

    socketService.on('modules.uninstall.end').subscribe((data: any) => {
      if (data.success) {
        this.$delete(this.widgets, data.app.installId);
        this.widgetObservers.get(data.app.installId).unsubscribe();
        this.widgetObservers.delete(data.app.installId);
        console.log('Need to uninstall module here ' + data.app);
      }
    });
  },
  methods: {
    onLayoutChanged(evt: any) {
      const mirrorService = this.$container.get<MirrorService>(MirrorService.name);
      const accountService = this.$container.get<AccountService>(AccountService.name);

      let changedModules: WidgetsBox = {};

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
            changedModules[item.id] = item;
            accountService.getConnected().then((account) => mirrorService.setInstallConfig(account.user.id, item.id, item)).catch(err => console.log(err));
          }
        }
      });
    },

    beforeDestroy() {
      this.widgetsSubscribe.unsubscribe();
      this.widgetObservers.forEach(widgetObserver => widgetObserver.unsubscribe());
      const moduleService = this.$container.get<ModuleService>(ModuleService.name);

      const modules = moduleService.getAll();
      for (let moduleInstallId in modules) {
        const module = modules[moduleInstallId] as IModule;
        module.stop();
      }
    },

    setBothLayout(id: string, wBox: WidgetBox) {
      this.layout.push(wBox);
      this.oldLayout.set(id, wBox);
    }
  }
});