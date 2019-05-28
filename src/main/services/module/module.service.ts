import { injectable } from "inversify";
import GitService from "./git.service";
import LocalModuleService from "./local.module.service";
import SocketService from "../utils/socket.service";
import { BehaviorSubject } from 'rxjs';
import Elios from "../../elios/elios.controller";
import ContainerService from "../container/container.service";
import { app } from "electron";

const path = require('path');

const os = require('os');
const fs = require('fs');
const modulesPath = path.resolve(os.homedir(), '.elios', 'applications');

export interface IModuleRepository {
    installId: string;
    repository: string;
    version: string;
    commit: string | null;
    settings: any;
    name: string;
}

export interface IModule {
    title: string;
    name: string;
    version: string;
    requireVersion: number;
    showOnStart: boolean;
    template: any;
    html: any;
    data: any;
    computed: any;
    start: () => any;
    init: () => any;
    stop: () => any;
}

@injectable()
export default class ModuleService {

    private apps = new Map<string, IModuleRepository>();
    private runningApps: any = {};

    /**
     *
     * @param {GitService} gitService
     * @param {LocalModuleService} localModuleService
     * @param {SocketService} socketService
     */
    constructor(
        private gitService: GitService,
        private localModuleService: LocalModuleService,
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


    // private getDirectories(path: string) {
    //     return fs.readdirSync(path).filter(function (file: string) {
    //         return fs.statSync(path + '/' + file).isDirectory();
    //     });
    // }

    // /**
    //  * Load custom module with simple require and absolute path
    //  * 
    //  * @param {string} path
    //  */
    // private requireDynamically(path: string) {
    //     path = path.split('\\').join('/');
    //     return eval(`require('${path}');`);
    // }

    /**
     * 
     * @param app Start a already build application
     */
    startApp(app: IModuleRepository) {
        return new Promise(async (resolve, reject) => {
            if (this.runningApps[app.installId] != undefined) {
                console.log(`Application ${app.name} is already running`)
                resolve();
            }
            this.eliosController.initModule(app);
            setTimeout(() => {
                this.containerService.runApp(app.name).then(() => {
                    console.log("Application launched ", app);
                    this.runningApps[app.installId] = app;
                    // resolve(app);
                }).catch((err) => {
                    reject(err);
                })
            }, 100);
        })
    }

    // /**
    //  * Load module and init it
    //  *
    //  * @param {string} module
    //  * @returns {Promise<any>}
    //  */
    // private loadModule(module: IModuleRepository) {
    //     return this.startApp(module)
    // }

    /**
     * Check module for update and init it.
     *
     * @param {IModuleRepository} module
     * @returns {Promise<any>}
     */
    private check(module: IModuleRepository) {
        return new Promise(async (resolve, reject) => {
            if (this.localModuleService.has(module)) {
                // if (this.localModuleService.get(module).commit != module.commit) {
                //     await this.gitService.pull(module).then(async () => {
                //         await this.containerService.buildAppImage(path.resolve(modulesPath, module.name + '-' + module.version), module.name).then(() => {
                //             this.localModuleService.set(module);
                //         }).catch((err) => {
                //             console.error(err)
                //             reject(err);
                //         });
                //     }).catch((err) => {
                //         console.error('error pull');
                //         reject(err);
                //     });
                // }
            } else {
                await this.gitService.clone(module).then(async () => {
                    await this.containerService.buildAppImage(path.resolve(modulesPath, module.name + '-' + module.version), module.name).catch((err) => {
                        console.log(err)
                        reject(err);
                    });
                }).catch((err) => {
                    console.error('error clone', err);
                    reject(err);
                });
            }

            // return this.loadModule(module).then((m: any) => {
            //     if (!m) {
            //         reject(m);
            //         return;
            //     }
            //     this.localModuleService.set(module);
            //     console.log(m.name + ' initialized.');
            resolve();
            // });
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
    async loadAll(): Promise<any> {
        this.socketService.send('modules.load.start');
        let i = 0;
        for (let app of Array.from(this.apps.values())) {
            this.socketService.send('modules.install.start', {
                module: app, stats: {
                    total: this.apps.size,
                    current: i
                }
            });

            await this.check(app).then((m) => {
                this.socketService.send('modules.install.end', { success: true, module: m });
            }).catch((err) => {
                console.error(err);
                this.localModuleService.delete(app);
                this.socketService.send('modules.install.end', { success: false });
            });
            ++i;
        }
        this.socketService.send('modules.load.end');
    }

    // loadOrReloadDevModules() {
    //     const localModules = this.getDirectories(path.resolve('./modules'));

    //     localModules.forEach((moduleName: string) => {
    //         this.loadFromPath(path.resolve('./modules', moduleName), {
    //             repository: 'dev/' + moduleName,
    //             commit: null,
    //             version: 'dev',
    //             installId: 'dev-' + moduleName,
    //             settings: null,
    //             name: moduleName
    //         }).then((m: any) => {
    //             console.log('Local module loaded', moduleName)
    //         }).catch(() => {
    //             console.log('Local module error loaded', moduleName)
    //         });
    //     });  
    // }

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
        return this.check(module);
    }

    /**
    * Directly uninstall application
    *
    * @param {IModuleRepository} application
    */
    async uninstall(app: IModuleRepository): Promise<any> {
        this.socketService.send('modules.uninstall.start', { app: app });

        this.apps.delete(app.name);
        if (this.runningApps[app.installId] != undefined) {
            this.runningApps[app.installId] = undefined;
            this.eliosController.destroyModule(app);
        }

        return this.containerService.deleteAppImage(app.name).then(() => {
            this.localModuleService.delete(app);
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
    get(installId: string): IModule {
        return this.runningApps[installId];
    }

    /**
     * Return all initialized modules.
     *
     * @returns {IModule[]}
     */
    getAll() {
        return this.runningApps;
    }

    /**
     * Clear all module
     */
    clear() {
        const modules = this.getAll();
        Object.keys(modules).map((objectKey, index) => {
            const module = modules[objectKey];
            this.localModuleService.delete(module);
            delete this.runningApps[module.installId];
            this.runningApps = {};
        });

    }

}