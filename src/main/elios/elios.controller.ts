import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import { EliosController, EliosWidget } from "./interfaces/elios.interface";
const uuidv4 = require('uuid/v4')

@injectable()
export default class Elios implements EliosController {
    private _widgets: EliosWidget[] = [];
    private _widgetsSubjet: BehaviorSubject<EliosWidget> = new BehaviorSubject<EliosWidget>(this._widgets[0]);

    getWidgets() {
        return this._widgets;
    }

    getWidgetSubject() {
        return this._widgetsSubjet;
    }

    createWidget(args: {}): EliosWidget {
        const widget = {
            html: new BehaviorSubject(''),
            id: uuidv4()
        };
        this._widgets.push(widget);
        this._widgetsSubjet.next(widget)
        return widget;
    }
}