import { Controller, Module } from "elios-sdk";
export default class Test implements Module {
    name: string = '';

    requireVersion: string = '0.0.1';
    showOnStart: boolean = true;

    widget: any;
    it: any;

    constructor(private elios: Controller) {
        console.log('Construtor');
        console.log(elios);
        this.widget = elios.createWidget({

        });
    }

    init() {
        console.log('MODULE DEV LOADED ' + this.name);
    }

    start() {
        console.log('MODULE STARTED ' + this.name);



        let i = 0;

        this.it = setInterval(() => {
            this.widget.html.next(`<div>
            <div class="card" >
               Salut !
               
                <br>
                    ${i}
                </div>
            </div>
            
            <style>
                .card {
                    color: white;
                    padding: 10px;
                    height: 150px;
                    background-color: goldenrod;
                    border-radius: 5px;
                }
            </style>`
            );

            i++;
        }, 1000);

    }

    stop() {
        console.log('MODULE STOPED ' + this.name);
    }
}
