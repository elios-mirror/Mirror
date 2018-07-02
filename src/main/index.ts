import "reflect-metadata";
import { Container, injectable } from "inversify";
import modules from "./app.module";
import AppService from "./services/app.service";
import Di from "./di";

/**
 * Create the DI Container
 *
 * @type {Container}
 */
const container = new Container();
const di = new Di();

/**
 * Bind all entities into the Dependencies Injection Container
 */
function loadDependenciesModules(_modules: any[], type: boolean) {
    return new Promise((resolve) => {
        for(let module of _modules) {
            if (typeof module === "object") {
                loadDependenciesModules(module, type).then(resolve);
            } else if (module) {
                if (type === true) {
                    container.bind<any>(module).toSelf().inSingletonScope();
                } else {
                    di.add(module.name ? module.name : module.constructor.name, container.get<any>(module));
                }
            }
        }
        resolve();
    });
}

loadDependenciesModules(modules, true).then(() => {
    loadDependenciesModules(modules, false).then(() => {
        /**
         * Load App class from the container
         *
         * @type {App}
         */
        const app = container.resolve(App);

        app.start();
        global.container = di;

    });
});


/**
 * Entry point of your app
 */
@injectable()
export default class App {
    constructor(private appService: AppService) {
    }

    start() {
        this.appService.start();
    }
}
