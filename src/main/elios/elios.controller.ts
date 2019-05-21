import { injectable } from "inversify";
import { Subject } from "rxjs";
import { IModuleRepository } from "../services/module/module.service";
import * as elios_protocol from 'elios-protocol';

@injectable()
export default class Elios {
    private _connections: any = {};
    private _widgets: any[] = [];
    private _widgetsSubject = new Subject<any>();

    getWidgets() {
        return this._widgets;
    }

    getWidgetsSubject() {
        return this._widgetsSubject;
    }

    initModule(module: IModuleRepository) {
        this._connections[module.installId] = elios_protocol(`/tmp/${module.name}`);
        this._connections[module.installId].receive((message: string, command_type: number) => {
            console.log('New command from' + module.name);
            console.log('Command type :' + command_type);
            console.log('Message :\n', message);
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