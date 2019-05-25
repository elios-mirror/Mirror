import { injectable } from "inversify";
import { Subject, BehaviorSubject } from "rxjs";
import { IModuleRepository } from "../services/module/module.service";
import EliosProtocol from 'elios-protocol';
import * as fs from 'fs';

export interface Widget {
  id: string;
  html: BehaviorSubject<string>;
}

@injectable()
export default class Elios {
  private _connections: any = {};
  private _widgets: Widget[] = [];
  private _widgetsSubject = new Subject<Widget>();

  getWidgets() {
    return this._widgets;
  }

  getWidgetsSubject() {
    return this._widgetsSubject;
  }

    initModule(module: IModuleRepository) {
    console.log("Initialize SDK for " + module.name);

    // fs.unlinkSync(`/tmp/${module.name}_sdk`);
    // fs.unlinkSync(`/tmp/${module.name}_mirror`);
    this._connections[module.installId] = new EliosProtocol(`/tmp/${module.name}`);
    this._connections[module.installId].receive((message: string, command_type: number) => {
      console.log('New command from ' + module.name);
      console.log('Command type : ' + command_type);
      console.log('Message :\n', message);
      let widget;
      switch (command_type) {
        case 0:
          widget = {
            id: module.installId,
            html: new BehaviorSubject('')
          };
          this._widgets.push(widget);
          this._widgetsSubject.next(widget);
          break;
        case 2:
          widget = this._widgets.find((widget) => widget.id === module.installId);
          if (widget != undefined) {
            widget.html.next(message);
          }
          break;
      }
    });
  }

  destroyModule(module: IModuleRepository) {
    console.log('Destroy SDK for ' + module.name);
    this._connections[module.installId].close();
    delete this._connections[module.installId];
  }


  destroyAll() {
    Object.keys(this._connections).forEach((value, key) => {
      console.log(value, key);
    });
  }

  // createWidget(args: any) {
  //     const widget = {
  //         html: new BehaviorSubject(''),
  //         id: args.id
  //     };
  //     console.log(args);
  //     this._widgets.push(widget);
  //     this._widgetsSubject.next(widget)
  //     return widget;
  // }
}