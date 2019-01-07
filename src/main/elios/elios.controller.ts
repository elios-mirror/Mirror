import { injectable } from "inversify";
import { BehaviorSubject, Subject, Observable } from "rxjs";
import { EliosController, EliosWidget } from "./interfaces/elios.interface";
const uuidv4 = require('uuid/v4')

@injectable()
export default class Elios implements EliosController {
    private _widgets: EliosWidget[] = [];
    private _widgetsSubject = new Subject<EliosWidget>();

    getWidgets() {
        return this._widgets;
    }

    getWidgetsSubject() {
        return this._widgetsSubject;
    }

    createWidget(args: {}): EliosWidget {
        const widget = {
            html: new BehaviorSubject(''),
            id: uuidv4()
        };
        console.log('add widget hre')
        this._widgets.push(widget);
        this._widgetsSubject.next(widget)
        return widget;
    }
}