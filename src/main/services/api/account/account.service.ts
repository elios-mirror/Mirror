import { injectable } from "inversify";
import CookieService from "../../utils/cookie.service";
import UserService from "./user/user.service";
import ModuleService from "../../module/module.service";
import MirrorService from "../mirror/mirror.service";
import SocketService from "../../utils/socket.service";
import { BehaviorSubject } from "rxjs";


export interface AccountDTO {
    userId: string;
    access_token: string;
}

@injectable()
export default class AccountService {
    private isAuth: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private isReload: boolean = false;

    private accounts: Map<string, AccountDTO> = new Map<string, AccountDTO>();
    private connected: string | null = null;

    constructor(
        private mirrorService: MirrorService,
        private cookieService: CookieService,
        private userService: UserService,
        private moduleService: ModuleService,
        private socketService: SocketService
    ) {
        if (cookieService.has("accounts") && cookieService.has("connected")) {
            this.accounts = this.buildMap(cookieService.get('accounts'));
            this.connected = cookieService.get('connected');
            this.userService.get().then(() => {
                this.isAuth.next(true);
                this.socketService.send('app.reload'); // TODO : remove that !
            }).catch(() => {
                this.logout(this.connected);
            });
        }
    }

    logout(userId: null | string = null) {
        this.isAuth.next(false);
        if (this.connected && this.connected == userId) {
            this.moduleService.clear();
            this.connected = null;
            this.cookieService.delete('connected');
        }
        if (userId) {
            this.accounts.delete(userId);
        } else {
            this.accounts.clear();
        }
        this.save();
    }

    add(userId: string, access_token: string) {
        const account = {
            userId: userId,
            access_token: access_token
        } as AccountDTO;
        this.accounts.set(userId, account);
        this.connected = account.userId;
        this.isAuth.next(true);
        this.save();
        this.socketService.send('app.reload');
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
                if (this.connected && account.userId === this.connected) {
                    resolve(account);
                }
            });
            reject();
        });
    }

    mapToObj(inputMap: Map<string, AccountDTO>) {
        let obj = {} as any;

        inputMap.forEach(function (value, key) {
            obj[key] = value
        });

        return obj;
    }

    buildMap(obj: any) {
        let map = new Map();
        Object.keys(obj).forEach(key => {
            map.set(key, obj[key]);
        });
        return map;
    }


    save() {
        this.cookieService.set('accounts', this.mapToObj(this.accounts));
        this.cookieService.set('connected', this.connected);
    }

    loginAs(userId: string) {
        this.get(userId).then((account) => {
            const connectedAs = this.connected;
            this.connected = account.userId;
            this.userService.get().then((user) => {
                this.isAuth.next(true);
                this.save();
                this.socketService.send('app.reload');
                this.loadModules();
            }).catch(() => {
                this.isAuth.next(false);
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
                    this.isAuth.next(false);
                    reject(err);
                });;
            })

        });
    }

    isAuthenticated(): BehaviorSubject<boolean> {
        return this.isAuth;
    }

    canReload(): boolean {
        return this.isReload === false;
    }
}
