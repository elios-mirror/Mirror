import {Module, Controller} from 'elios-sdk';

export default class Clock implements Module {
    name: string = '';

    requireVersion: string = '0.0.1';
    showOnStart: boolean = true;

    widget: any;
    it: any;

    constructor(private elios: Controller) {
        console.log('Construtor');
        this.widget = elios.createWidget({
        });
    }

    init() {
        console.log('MODULE DEV LOADED ' + this.name);
    }

    start() {
        console.log('MODULE STARTED ' + this.name);

        this.it = setInterval(() => {
            const date = new Date();

            this.widget.html.next(`<div>
            <div class="clock" >
             ${date.getHours()} : ${date.getMinutes()} : ${date.getSeconds()}
            </div>
            
            <style>
                .clock {
                  font-size: 2em;
                  font-height: bold;
                }
            </style>`
            );
        }, 1000);

    }

    stop() {
        clearInterval(this.it);
        console.log('MODULE STOPED ' + this.name);
    }
}
