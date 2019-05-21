import { injectable } from "inversify";
import GitService from "./git.service";
import LocalModuleService from "./local.module.service";
import SocketService from "../utils/socket.service";
import { BehaviorSubject } from 'rxjs';
import Elios from "../../elios/elios.controller";
import ContainerService from "../container/container.service";

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

    private modules: IModuleRepository[] = [];
    private initializedModules: any = {};

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

    /**
     * Load custom module with simple require and absolute path
     * 
     * @param {string} path
     */
    private requireDynamically(path: string) {
        path = path.split('\\').join('/');
        return eval(`require('${path}');`);
    }


    private loadFromPath(moduleRepository: IModuleRepository) {
        return new Promise(async (resolve, reject) => {

            // if (module.requireVersion) {
            //     console.log('Check Launcher version for module ' + module.name + ' - Minimum version:  ' + module.requireVersion + ' - Current version: ' + global.version);
            //     if (ModuleService.cmpVersions(global.version, module.requireVersion) >= 0) {
            //         console.log('Version is ok!');
            //     } else {
            //         console.log('Version is incorrect. Skip module: ' + module.name);
            //         reject(module);
            //         return;
            //     }
            // }

            // if (module.showOnStart) {
            //     this.socketService.send('modules.install.init', { action: 'init_module', module: module.title ? module.title : module.name });
            // }

            // await module.init(null, () => {
            //     console.log(module.name + ' module initialized !');
            // });

            this.eliosController.initModule(moduleRepository);
            this.containerService.runApp(moduleRepository.name).then(() => {
                console.log("Application launched ", moduleRepository);
                this.initializedModules[moduleRepository.installId] = moduleRepository;
                resolve(moduleRepository);
            }).catch((err) => {
                console.error(err);
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     * Load module and init it
     *
     * @param {string} module
     * @returns {Promise<any>}
     */
    private loadModule(module: IModuleRepository) {
        return this.loadFromPath(module)
    }

    /**
     * Check module for update and init it.
     *
     * @param {IModuleRepository} module
     * @returns {Promise<any>}
     */
    private check(module: IModuleRepository) {
        return new Promise(async (resolve, reject) => {

            if (this.localModuleService.has(module)) {
                if (this.localModuleService.get(module).commit != module.commit) {
                    await this.gitService.pull(module).then(async () => {
                        await this.containerService.buildAppImage(path.resolve(modulesPath, module.name + '-' + module.version), module.name).then(() => {
                            this.localModuleService.set(module);
                        }).catch((err) => {
                            console.error(err)
                        });
                    }).catch(() => {
                        console.error('error pull');
                        reject();
                        return;
                    });
                }
            } else {
                await this.gitService.clone(module).then(async () => {
                    await this.containerService.buildAppImage(path.resolve(modulesPath, module.name + '-' + module.version), module.name).catch((err) => {
                        console.log(err)
                    });
                }).catch((err) => {
                    console.error('error clone', err);
                    reject();
                    return;
                });
            }

            return this.loadModule(module).then((m: any) => {
                if (!m) {
                    reject(m);
                    return;
                }
                this.localModuleService.set(module);
                console.log(m.name + ' initialized.');
                resolve(m);
            });
        });
    }

    /**
     * Load all modules.
     *
     * @returns {Promise<any>}
     */
    loadAll() {
        return new Promise((resolve) => {
            let totalOfModules = this.modules.length;
            this.socketService.send('modules.load.start');

            if (process.env.NODE_ENV === 'development') {
                // this.loadOrReloadDevModules();
            }

            let loadNextModule = () => {
                if (this.modules.length > 0) {
                    let nextModule = this.modules[0];
                    this.socketService.send('modules.install.start', {
                        module: nextModule, stats: {
                            total: totalOfModules,
                            current: ((totalOfModules - this.modules.length) + 1)
                        }
                    });

                    this.check(nextModule).then((m) => {
                        this.modules = this.modules.slice(1);
                        this.socketService.send('modules.install.end', { success: true, module: m });
                        loadNextModule();
                    }).catch(() => {
                        this.localModuleService.delete(nextModule);
                        this.modules = this.modules.slice(1);
                        this.socketService.send('modules.install.end', { success: false });
                        loadNextModule();
                    });
                } else {
                    this.socketService.send('modules.load.end');
                    resolve();
                }
            };
            loadNextModule();
        });
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
        this.modules.push(module);
    }

    /**
    * Directly install module
    *
    * @param {IModuleRepository} module
    */
    install(module: IModuleRepository): Promise<any> {
        this.modules.push(module);
        return this.loadAll();
    }

    /**
    * Directly uinstall module
    *
    * @param {IModuleRepository} module
    */
    uninstall(): Promise<any> {
        return new Promise<any>((resolve, reject) => {

        });
    }

    /**
     * Get module by version
     *
     * @param {string} installId
     */
    get(installId: string): IModule {
        return this.initializedModules[installId];
    }

    /**
     * Return all initialized modules.
     *
     * @returns {IModule[]}
     */
    getAll() {
        return this.initializedModules;
    }

    /**
     * Clear all module
     */
    clear() {
        const modules = this.getAll();
        Object.keys(modules).map((objectKey, index) => {
            const module = modules[objectKey];
            this.localModuleService.delete(module);
            delete this.initializedModules[module.installId];
            this.initializedModules = {};
        });

    }

}