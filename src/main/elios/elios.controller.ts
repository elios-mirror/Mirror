import { injectable } from "inversify";
import { Subject, BehaviorSubject } from "rxjs";
import { IModuleRepository } from "../services/module/module.service";
import SocketService from "../services/utils/socket.service";
import MirrorService from "../services/api/mirror/mirror.service";
import CookieService from "../services/utils/cookie.service";
import SocketIoService from "../services/utils/socket-io.service";
const { createConnection } = require('elios-protocol');

export interface Widget {
  id: string;
  html: BehaviorSubject<string>;
}

@injectable()
export default class Elios {
  private _whitelist: any = {};
  private _widgets: Widget[] = [];
  private _widgetsSubject = new Subject<Widget>();
  private _connection: any;


  constructor(
    private socketService: SocketService,
    private socketIoService: SocketIoService,
    private cookieService: CookieService,
    private mirrorService: MirrorService
  ) {

    this._connection = createConnection(`/tmp/elios_mirror`, 'mirror');

    this._connection.receive((message: string, sender_id: string, command_type: number, reply: (msg: string, cmd: number) => {}) => {

      let widget = this._widgets.find((widget) => widget.id === sender_id);
      switch (command_type) {
        case 0:
          let newWidget = {
            id: sender_id,
            html: new BehaviorSubject('')
          };
          if (widget != undefined) {
            console.log('Module already registered', sender_id);
          } else {
            this._widgets.push(newWidget);
            this._widgetsSubject.next(newWidget);
          }

          console.log(this._widgets);
          break;
        case 2:
          widget = this._widgets.find((widget) => widget.id === sender_id);
          if (widget != undefined) {
            widget.html.next(message);
          }
          break;
        case 3:
          for (var i = 0; i < this._widgets.length; i++) {
            if (this._widgets[i].id === sender_id) {
              this._widgets.splice(i, 1);
              i--;
            }
          }
          console.log('Delete module => ', sender_id);
          const mirrorId = cookieService.get('id');
          this.socketIoService.socket.removeAllListeners(`module_config_updated_${sender_id}_${mirrorId}`);
          this.socketService.send('modules.uninstall.end', { success: true, app: { installId: sender_id } })
          break;
        case 4:
          this.mirrorService.getModules(this.cookieService.get('connected')).then((modules) => {
            modules.forEach((module) => {
              if (module.module.name === sender_id) {
                this.mirrorService.getModuleConfig(module.id).then((data) => {
                  reply(JSON.stringify(data), 5);
                  const mirrorId = cookieService.get('id');
                  this.socketIoService.socket.on(`module_config_updated_${sender_id}_${mirrorId}`, (socketData: any) => {
                    reply(socketData.config, 5);
                    console.log('changed module config', socketData.config);
                  });
                  return;
                });
              }
            })
          });
          break;
      }
      console.log(`New protocol msg form ${sender_id} command_type=${command_type} => ${message} `);
    });
  }

  getWidgets() {
    return this._widgets;
  }

  getWidgetsSubject() {
    return this._widgetsSubject;
  }

  initModule(module: IModuleRepository) {
    console.log("Initialize SDK for " + module.name);

    this._whitelist[module.installId] = module;
    console.log(this._whitelist);
  }

  destroyModule(module: IModuleRepository) {
    console.log('Destroy SDK for ' + module.name);
    // this._whitelist[module.installId].close();
    delete this._whitelist[module.installId];
  }


  destroyAll() {
    Object.keys(this._whitelist).forEach((value, key) => {
      console.log(value, key);
    });
  }

  quit() {
    this._connection.close();
  }
}