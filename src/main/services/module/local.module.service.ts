import {injectable} from "inversify";
import {IModuleRepository} from "./module.service";
import CookieService from "../utils/cookie.service";

const os = require('os');
const path = require('path');
const fs = require('fs');

@injectable()
export default class LocalModuleService {

    local = path.resolve(os.homedir(), '.elios', 'applications') + '/';
    modules: any = {};

    /**
     *
     * @param cookieService
     */
    constructor(private cookieService: CookieService) {
        if (cookieService.has('modules')) {
            this.modules = cookieService.get('modules')
        }

        const modulesFolder = path.resolve(os.homedir(), '.elios');

        if (!fs.existsSync(modulesFolder)){
            fs.mkdirSync(modulesFolder);
        }

    }

    /**
     * Add module
     *
     * @param module
     */
    set(module: IModuleRepository) {
        this.modules[module.installId] = module;
        this.save();
    }

    /**
     * Get module
     *
     * @returns {any}
     * @param module
     */
    get(module: IModuleRepository): IModuleRepository {
        if (this.modules[module.installId]) {
            return this.modules[module.installId]
        } else {
            return {
                commit: '',
                repository: module.repository,
                version: module.version,
                installId: module.installId,
                settings: null,
                name: module.name
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
        console.log(this.getLocal() + module.name + '-' + module.version);
        
        if (!fs.existsSync(this.getLocal() + module.name + '-' + module.version)) {
            console.log("Not existing");
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
            this.deleteFolderRecursive(this.getLocal() + module.name + '-' + module.version);
            delete this.modules[module.installId];
            this.save()
        } else if (fs.existsSync(this.getLocal() + module.name + '-' + module.version)) {
            this.deleteFolderRecursive(this.getLocal() + module.name + '-' + module.version);
        }
    }

    /**
     * Delete a module
     *
     * @param {string} path
     */
    deleteFolderRecursive(_path: string) {
        if (fs.existsSync(_path)) {
            fs.readdirSync(_path).forEach((file: any, index: any) => {
                const curPath = path.resolve(_path, file);
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(_path);
        }
    };

    /**
     * Save cookies in file
     */
    save() {
        this.cookieService.set('modules', this.modules)
    }
}
