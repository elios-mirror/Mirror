export default class {
    name: string = 'test';

    type: string = 'game';
    requireVersion: string = '0.0.1';
    showOnStart: boolean = true;

    template: any = require("./index.html");

    data: any = {
        title: 'Chargement...',
        body: '00 : 00 : 00'
    };

    constructor(private container: any) {
        console.log('Construtor');
    }

    init() {
        console.log('MODULE DEV LOADED');
       

    }

    start() {
        console.log('MODULE STARTED');

       
    }
}
