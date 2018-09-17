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
        console.log(container);
    }

    init() {
        console.log('MODULE DEV LOADED');
        setInterval(() => {
            const date = new Date();
            this.data.body = date.getHours() + ' - ' + date.getMinutes() + ' - ' + date.getSeconds()
            setTimeout(() => {
                const date = new Date();
                this.data.body = date.getHours() + ' : ' + date.getMinutes() + ' : ' + date.getSeconds()
            }, 500);
        }, 1000);

    }

    start() {
        console.log('MODULE STARTED');

        const userService = this.container.get('UserService');
        userService.get().then((res: any) => {
            this.data.title = `L'horloge de - ${res.name}`;
        })
    }
}
