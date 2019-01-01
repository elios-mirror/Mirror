import { injectable } from "inversify";
import { app, BrowserWindow, webFrame, globalShortcut } from 'electron';
import ModuleService from './module/module.service';
import LoggerService from "./utils/logger.service";
import AccountService, { AccountDTO } from "./api/account/account.service";
import UserService from "./api/account/user/user.service";
import SocketService from "./utils/socket.service";
import CookieService from "./utils/cookie.service";
import MirrorService from "./api/mirror/mirror.service";

global.version = require('../../../package.json').version;

@injectable()
export default class AppService {

    private winUrl: string = process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`;

    private mainWindow: any;

    constructor(private moduleService: ModuleService, private loggerService: LoggerService,
        private authService: AccountService, private userService: UserService,
        private socketService: SocketService, private cookieService: CookieService,
        private mirrorService: MirrorService) {
        this.loggerService.debug('Starting App in version: ' + global.version);
    }

    /**
     * Initialize electron handlers
     */
    start() {
        app.on('ready', () => {
            this.createWindow();
            this.registerShortcuts();
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (this.mainWindow === null) {
                this.createWindow();
            }
        });

        if (this.cookieService.has('id') && this.cookieService.has('access_token')) {
            this.mirrorService.get().then((res) => {
                console.log("Mirror ok ", res);
            }).catch(() => {
                this.registerMirror().then(() => {
                });
            });
        } else {
            this.registerMirror().then(() => {
            });
        }
    }

    registerMirror() {
        return new Promise(resolve => {
            this.mirrorService.register().then((res) => {
                this.cookieService.set('id', res.id);
                this.cookieService.set('access_token', res.access_token);
                this.cookieService.delete('accounts');
                this.cookieService.delete('connected');
                console.log(res);
            }).catch(error => {
                console.log(error);
            });
        });
    }

    /**
     * Create the mainWindow of your app
     */
    createWindow() {
        this.mainWindow = new BrowserWindow({
            // fullscreen: true,
            show: false,
            frame: false,
            resizable: true,
            backgroundColor: '#000000',
            center: true,
            fullscreenable: true
        }) as BrowserWindow;

        // Disable zoom feature on window
        const webContents = this.mainWindow.webContents;
        webContents.on('did-finish-load', () => {
            webContents.setZoomFactor(1);
            webContents.setVisualZoomLevelLimits(1, 1);
            webContents.setLayoutZoomLevelLimits(0, 0);
        });

        this.mainWindow.loadURL(this.winUrl);

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }



    registerShortcuts() {

        globalShortcut.register('CommandOrControl+L', () => {
            const accounts = this.cookieService.get('accounts');
            const connected = this.cookieService.get('connected');
            accounts.forEach((account: AccountDTO) => {
                if (account.userId != connected.userId) {
                    this.authService.loginAs(account.userId);
                }
            });
        });
        globalShortcut.register('CommandOrControl+N', () => {
            this.socketService.send('accounts.login');
        });

        globalShortcut.register('CommandOrControl+R', () => {
            this.socketService.send('app.reload');
        });

        globalShortcut.register('CommandOrControl+T', () => {
            this.mainWindow.openDevTools();
        });

    }
}