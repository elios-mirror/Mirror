import { EliosController } from "../../../src/main/elios/interfaces/elios.interface";

interface EliosModule {

    /**
     * Define what lowest version of the mirror your module need
     */
    readonly requireVersion: string;

    /**
     * Define if you want to show module in account loading message
     */
    readonly showOnStart: boolean;

    /**
     * Called when module was loaded
     */
    init: () => void;

    /**
     * Will be called when module need to be started
     */
    start: () => void;

    /**
     * Will be called when module need to be stopped
     */
    stop: () => void;
}



export default class Module implements EliosModule {
    name: string = '';

    requireVersion: string = '0.0.1';
    showOnStart: boolean = true;

    widget: any;
    it: any;

    constructor(private elios: EliosController) {
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
