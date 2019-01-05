import { BehaviorSubject } from "rxjs";

export interface EliosWidget {
    id: string;
    html: BehaviorSubject<string>;
}

export interface EliosController {
    createWidget(args: {}): EliosWidget;
}