import { injectable } from "inversify";
import { BehaviorSubject, Subject } from "rxjs";
import { EliosController, EliosWidget } from "./interfaces/elios.interface";

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

    createWidget(args: any): EliosWidget {
        const widget = {
            html: new BehaviorSubject(''),
            id: args.id
        };
        console.log(args);
        this._widgets.push(widget);
        this._widgetsSubject.next(widget)
        return widget;
    }
}