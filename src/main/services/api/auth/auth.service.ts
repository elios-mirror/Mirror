import { injectable } from "inversify";
import ApiService from "../api.service";
import LoginDto from "./login.dto";
import ConfigService from "../../utils/config.service";
import CookieService from "../../utils/cookie.service";
import UserService from "../account/user/user.service";
import ModuleService from "../../module/module.service";
import UserDTO from "../account/user/user.dto";
import MirrorService from "../mirror/mirror.service";

@injectable()
export default class AuthService {
    private isAuth: boolean = false;
    private isReload: boolean = false;

    constructor(
        private mirrorService: MirrorService,
        private cookieService: CookieService,
        private userService: UserService,
        private moduleService: ModuleService
    ) {
        if (cookieService.has("access_token")) {
            this.userService.get().then(() => {
                this.isAuth = true;
            }).catch(() => {
                this.cookieService.delete("access_token");
                this.cookieService.delete("refresh_token");
            }) ;
        }
    }

    logout() {
        this.moduleService.clear();
        this.isAuth = false;
        this.cookieService.delete("access_token");
        this.cookieService.delete("refresh_token");
    }

    login(access_token: string) {
        this.cookieService.set('access_token', access_token);
        this.isAuth = true;
    }

    loadModules() {
        this.isReload = true;
        return new Promise((resolve, reject) => {

            this.mirrorService.get().then((res) => {

                console.log(res);
                
                for (let module of res.modules) {
                    this.moduleService.add({
                        commit: module.commit,
                        repository: module.module.repository,
                        version: module.version
                    });
                }
                this.moduleService.loadAll().then(() => {
                    this.isReload = false;
                    resolve();
                });
            }).catch(err => {
                this.isReload = false;
                reject(err);
            });;
        });
    }

    isAuthenticated(): boolean {
        return this.isAuth;
    }

    canReload(): boolean {
        return this.isReload === false;
    }


}
