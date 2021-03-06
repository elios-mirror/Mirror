import { injectable } from "inversify";
import SocketService from "../utils/socket.service";
import { BehaviorSubject } from 'rxjs';
import Elios from "../../elios/elios.controller";
import ContainerService from "../container/container.service";

const path = require('path');

const os = require('os');
const modulesPath = path.resolve(os.homedir(), '.elios', 'applications');

export interface IModuleRepository {
    installId: string;
    repository: string;
    version: string;
    commit: string | null;
    settings: any;
    name: string;
}

@injectable()
export default class ModuleService {

    private apps = new Map<string, IModuleRepository>();
    private runningApps = new Map<string, IModuleRepository>();

    /**
     *
     * @param {GitService} gitService
     * @param {LocalModuleService} localModuleService
     * @param {SocketService} socketService
     */
    constructor(
        private socketService: SocketService,
        private eliosController: Elios,
        private containerService: ContainerService
    ) {

    }

    /**
     * Check if version A is less than B
     *
     * @param {string} a
     * @param {string} b
     * @returns {any}
     */
    private static cmpVersions(a: string, b: string) {
        let i, diff;
        const regExStrip0 = /(\.0+)+$/;
        const segmentsA = a.replace(regExStrip0, '').split('.');
        const segmentsB = b.replace(regExStrip0, '').split('.');
        const l = Math.min(segmentsA.length, segmentsB.length);

        for (i = 0; i < l; i++) {
            diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
            if (diff) {
                return diff;
            }
        }
        return segmentsA.length - segmentsB.length;
    }

    /**
     * 
     * @param app Start an already build application
     */
    startApp(app: IModuleRepository) {
        return new Promise(async (resolve, reject) => {
            if (this.runningApps.has(app.installId)) {
                console.log(`Application ${app.name} is already running`)
                resolve();
            }
            this.eliosController.initModule(app);
            setTimeout(() => {
                this.containerService.runApp(app.name).then(() => {
                    console.log("Application launched ", app);

                    this.runningApps.set(app.installId, app);
                    resolve();
                }).catch((err) => {
                    reject(err);
                })
            }, 100);
        })
    }

    stopApp(app: IModuleRepository) {
        this.containerService.stopApp(app.name);
        this.runningApps.delete(app.installId);
    }

    /**
     * Check module for update and init it.
     *
     * @param {IModuleRepository} module
     */
    private async installOrUpdate(module: IModuleRepository) : Promise<any> {
        console.log(`Start pulling ${module.name}`);
        return this.containerService.installOrUpdateApp(module.repository).then(() => {
            console.log(`Application ${module.name} pulled`);
        }).catch((err) => {
            console.error(err);
            throw err;
        });
    }

    /**
     * Start all applications
     */
    startAllApps() {
        this.apps.forEach(app => {
            this.startApp(app).catch((err) => {
                console.error(err);
            });
        });
    }

    /**
     * Check new app, app update and build them
     */
    loadAndStartAll() {
        this.socketService.send('modules.load.start');
        this.apps.forEach(async app => {
            this.installOrUpdate(app).then((m) => {
                this.startApp(app).catch((err) =>{
                    console.error(err);
                });
                // this.socketService.send('modules.install.end', { success: true, module: m });
            }).catch((err) => {
                console.error(err);
                // this.socketService.send('modules.install.end', { success: false });
            });
        });
        this.socketService.send('modules.load.end');
    }

    stopAll() {
        this.runningApps.forEach((app: IModuleRepository) => {
            this.stopApp(app);
        });
    }

    /**
     * Add a module before load.
     *
     * @param {IModuleRepository} module
     */
    add(module: IModuleRepository) {
        this.apps.set(module.name, module);
    }

    /**
    * Directly install module
    *
    * @param {IModuleRepository} module
    */
    install(module: IModuleRepository) {
        this.apps.set(module.name, module);
        return this.installOrUpdate(module);
    }

    /**
    * Directly uninstall application
    *
    * @param {IModuleRepository} application
    */
    async uninstall(app: IModuleRepository): Promise<any> {
        this.socketService.send('modules.uninstall.start', { app: app });

        this.apps.delete(app.name);
        if (this.runningApps.has(app.installId)) {
            this.runningApps.delete(app.installId);
            this.eliosController.destroyModule(app);
        }

        return this.containerService.deleteAppImage(app.name).then(() => {
            this.socketService.send('modules.uninstall.end', { success: true, app: app });
        }).catch((err) => {
            this.socketService.send('modules.uninstall.end', { success: false, app: app });
            throw err;
        });
    }

    /**
     * Get module by version
     *
     * @param {string} installId
     */
    get(installId: string): IModuleRepository | undefined  {
        return this.runningApps.get(installId);
    }

    /**
     * Return all initialized modules.
     * 
     */
    getAll(): Map<string, IModuleRepository> {
        return this.runningApps;
    }

    /**
     * Clear all module
     */
    clear() {
        console.log('[module.service] Need to rework clear')
        // const modules = this.getAll();
        // Object.keys(modules).map((objectKey, index) => {
        //     const module = modules[objectKey];
        //     this.localModuleService.delete(module);
        //     delete this.runningApps[module.installId];
        //     this.runningApps = {};
        // });

    }

}