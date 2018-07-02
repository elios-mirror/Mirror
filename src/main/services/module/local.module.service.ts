import {injectable} from "inversify";
import {IModuleRepository} from "./module.service";
import CookieService from "../utils/cookie.service";
import GitService from "./git.service";

const os = require('os');
const path = require('path');
const fs = require('fs');

@injectable()
export default class LocalModuleService {

    local = path.resolve(os.homedir(), '.ezgames', 'modules') + '/';
    modules: any = {};

    /**
     *
     * @param cookieService
     */
    constructor(private cookieService: CookieService) {
        if (cookieService.has('modules')) {
            this.modules = cookieService.get('modules')
        }
    }

    /**
     * Add module
     *
     * @param module
     */
    set(module: IModuleRepository) {
        this.modules[module.repository + '-' + module.version] = module;
        this.save();
    }

    /**
     * Get module
     *
     * @returns {any}
     * @param module
     */
    get(module: IModuleRepository): IModuleRepository {
        if (this.modules[module.repository + '-' + module.version]) {
            return this.modules[module.repository + '-' + module.version]
        } else {
            return {
                commit: '',
                repository: module.repository,
                version: module.version
            }
        }
    }

    /**
     * Get local path of modules
     *
     * @returns {string}
     */
    getLocal() {
        return this.local;
    }

    /**
     * Check module exist
     *
     * @returns {boolean}
     * @param module
     */
    has(module: IModuleRepository) {
        const moduleName = path.basename(module.repository);
        if (!fs.existsSync(this.getLocal() + moduleName + '-' + module.version)) {
            return false;
        }
        return true;
    }

    /**
     * Delete module by name or repository
     *
     * @param module
     */
    delete(module: IModuleRepository) {
        if (this.has(module)) {
            this.deleteFolderRecursive(this.getLocal() + path.basename(module.repository) + '-' + module.version);
            delete this.modules[module.repository + '-' + module.version];
            this.save()
        } else if (fs.existsSync(this.getLocal() + path.basename(module.repository) + '-' + module.version)) {
            this.deleteFolderRecursive(this.getLocal() + path.basename(module.repository) + '-' + module.version);
        }
    }

    /**
     * Delete a module
     *
     * @param {string} path
     */
    deleteFolderRecursive(path: string) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file: any, index: any) => {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    /**
     * Save cookies in file
     */
    save() {
        this.cookieService.set('modules', this.modules)
    }
}
