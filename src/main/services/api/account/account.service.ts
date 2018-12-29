import { injectable } from "inversify";
import CookieService from "../../utils/cookie.service";
import UserService from "./user/user.service";
import ModuleService from "../../module/module.service";
import MirrorService from "../mirror/mirror.service";


export interface AccountDTO {
    userId: string;
    access_token: string;
}

@injectable()
export default class AccountService {
    private isAuth: boolean = false;
    private isReload: boolean = false;

    private accounts: AccountDTO[] = [];
    private connected: AccountDTO | null = null;

    constructor(
        private mirrorService: MirrorService,
        private cookieService: CookieService,
        private userService: UserService,
        private moduleService: ModuleService
    ) {
        if (cookieService.has("accounts") && cookieService.has("connected")) {
            this.accounts = cookieService.get('accounts');
            this.connected = cookieService.get('connected');
            this.userService.get().then(() => {
                this.isAuth = true;
            })
        }
    }

    logout(userId: string) {
        this.moduleService.clear();
        this.isAuth = false;
    }

    add(userId: string, access_token: string) {
        const account = {
            userId: userId,
            access_token: access_token
        } as AccountDTO;
        this.accounts.push(account);
        this.connected = account;
        this.isAuth = true;
        this.save();
    }

    get(userId: string): Promise<AccountDTO> {
        return new Promise((resolve, reject) => {
            this.accounts.forEach((account) => {
                if (account.userId === userId) {
                    resolve(account);
                }
            });
            return reject();
        });
    }

    getConnected(): Promise<AccountDTO> {
        return new Promise((resolve, reject) => {
            this.accounts.forEach((account) => {
                if (this.connected && account.userId === this.connected.userId) {
                    resolve(account);
                }
            });
            reject();
        });
    }

    save() {
        this.cookieService.set('accounts', this.accounts);
        this.cookieService.set('connected', this.connected);
    }

    loginAs(userId: string) {
        this.get(userId).then((account) => {
            const connectedAs = this.connected;
            this.connected = account
            this.userService.get().then(() => {
                this.isAuth = true;
                this.save();
                this.loadModules();
            }).catch(() => {
                this.isAuth = false;
                this.connected = connectedAs;
            });
        })
    }

    loadModules() {
        this.isReload = true;
        return new Promise((resolve, reject) => {

            this.getConnected().then((user) => {
                this.mirrorService.getModules(user.userId).then((modules) => {
                    for (let module of modules) {
                        this.moduleService.add({
                            commit: module.commit,
                            repository: module.module.repository,
                            version: module.version,
                            installId: module.pivot.install_id
                        });
                    }
                    this.moduleService.loadAll().then(() => {
                        this.isReload = false;
                        resolve();
                    });
                }).catch(err => {
                    this.isReload = false;
                    this.isAuth = false;
                    reject(err);
                });;
            })

        });
    }

    isAuthenticated(): boolean {
        return this.isAuth;
    }

    canReload(): boolean {
        return this.isReload === false;
    }


}
