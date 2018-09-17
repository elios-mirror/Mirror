export default class Di{

    modules: any;

    constructor() {
        this.modules = {};
    }


    add(name: string, module: any) {
        this.modules[name] = module;
    }

    get<T>(module: string): T {
        return (this.modules[module]);
    }
}