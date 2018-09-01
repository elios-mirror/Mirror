import {injectable} from "inversify";
import GitService from "./git.service";
import LocalModuleService from "./local.module.service";
import SocketService from "../utils/socket.service";

const path = require('path');

const os = require('os');
const fs = require('fs');
const modulesPath = path.resolve(os.homedir(), '.elios', 'modules');

let PluginManager: any;

if (process.env.NODE_ENV !== 'testing') {
    PluginManager = require("live-plugin-manager").PluginManager;
    PluginManager = new PluginManager({
        pluginsPath: modulesPath
    });
}

export interface IModuleRepository {
    repository: string;
    version: string;
    commit: string | null;
}

export interface IModule {
    title: string;
    name: string;
    version: string;
    requireVersion: number;
    showOnStart: boolean;
    start: () => {};
    init: () => {};
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
    constructor(private gitService: GitService, private localModuleService: LocalModuleService, private socketService: SocketService) {
        const localModules = this.getDirectories(path.resolve('./modules'));

        localModules.forEach((moduleName: string) => {
            this.loadFromPath(path.resolve('./modules', moduleName), {
                repository: 'dev/' + moduleName,
                commit: null,
                version: '1.0.0'
            }).then(() => {
                console.log('Local module loaded', moduleName)
            }).catch(() => {
                console.log('Local module error loaded', moduleName)
            });
        })

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


    private getDirectories(path: string) {
        return fs.readdirSync(path).filter(function (file: string) {
            return fs.statSync(path + '/' + file).isDirectory();
        });
    }


    private loadFromPath(modulePath: string, module: IModuleRepository) {
        const moduleName = path.basename(module.repository);
        return PluginManager.installFromPath(modulePath, {force: true}).then(async (m: any) => {
            const moduleInfos = m;
            m = PluginManager.require(moduleName);

            if (m.default) {
                m = new m.default();
            }

            m.version = moduleInfos.version;
            m.name = moduleInfos.name;
            m.repository = module.repository;

            if (m.requireVersion) {
                console.log('Check Launcher version for module ' + moduleName + ' - Minimum version:  ' + m.requireVersion + ' - Current version: ' + global.version);
                if (ModuleService.cmpVersions(global.version, m.requireVersion) >= 0) {
                    console.log('Version is ok!');
                } else {
                    console.log('Version is incorrect. Skip module: ' + moduleName);
                    return;
                }
            }

            if (m.showOnStart) {
                this.socketService.send('loading', {action: 'init_module', module: m.title ? m.title : m.name});
            }
            await m.init(null, () => {
                console.log(m.name + ' module initialized !');
            });
            this.initializedModules[moduleName + '-' + module.version] = m;
            return (m);
        }).catch((res: any) => {
            console.error(res);
            return;
        });
    }

    /**
     * Load module and init it
     *
     * @param {string} module
     * @returns {Promise<any>}
     */
    private loadModule(module: IModuleRepository) {
        return this.loadFromPath(path.resolve(modulesPath, path.basename(module.repository) + '-' + module.version), module)
    }

    /**
     * Check module for update and init it.
     *
     * @param {IModuleRepository} module
     * @returns {Promise<any>}
     */
    check(module: IModuleRepository) {
        return new Promise(async (resolve, reject) => {

            if (this.localModuleService.has(module)) {
                if (this.localModuleService.get(module).commit != module.commit) {
                    await this.gitService.pull(module).then(() => {
                        this.localModuleService.set(module);
                    }).catch(() => {
                        console.log('error pull');
                        reject();
                        return;
                    });
                }
            } else {
                await this.gitService.clone(module).then(() => {
                }).catch((err) => {
                    console.log('error clone', err);
                    reject();
                    return;
                });
            }

            this.loadModule(module).then((m: any) => {
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

            console.log('Loading modules...');

            let loadNextModule = () => {
                if (this.modules.length > 0) {
                    let nextModule = this.modules[0];
                    this.socketService.send('loading', {
                        action: 'message',
                        message: 'Download module: ' + path.basename(nextModule.repository) + ' v' + nextModule.version + ' <br>' + ((totalOfModules - this.modules.length) + 1) + '/' + totalOfModules
                    });
                    this.check(nextModule).then(() => {
                        this.modules = this.modules.slice(1);
                        loadNextModule();
                    }).catch(() => {
                        this.localModuleService.delete(nextModule);
                        this.modules = this.modules.slice(1);
                        loadNextModule();
                    });
                } else {
                    resolve();
                }
            };
            loadNextModule();
        });
    }

    /**
     * Add a module before load.
     *
     * @param {IModuleRepository} module
     */
    add(module: IModuleRepository) {
        this.modules.push(module);
    }

    /**
     * Get module by version
     *
     * @param {string} name
     * @param {string} version
     */
    get(name: string, version: string): IModule {
        return this.initializedModules[name + '-' + version];
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
        PluginManager.uninstallAll();
        Object.keys(modules).map((objectKey, index) => {
            const module = modules[objectKey];
            this.localModuleService.delete(module);
            delete this.initializedModules[module.name + '-' + module.version];
        });
    }

}