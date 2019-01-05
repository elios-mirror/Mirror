import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import { EliosController, EliosWidget } from "./interfaces/elios.interface";

@injectable()
export default class Elios implements EliosController {
    private _widgets: EliosWidget[] = [];

    getWidgets() {
        return this._widgets;
    }

    createWidget(args: {}): EliosWidget {
        const widget = {
            html: new BehaviorSubject(''),
            id: 'toto'
        };
        this._widgets.push(widget);
        return widget;
    }
}