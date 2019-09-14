import { injectable } from "inversify";
import { app, BrowserWindow, webFrame, globalShortcut, Menu } from 'electron';
import ModuleService from './module/module.service';
import LoggerService from "./utils/logger.service";
import AccountService, { AccountDTO } from "./api/account/account.service";
import UserService from "./api/account/user/user.service";
import SocketService from "./utils/socket.service";
import CookieService from "./utils/cookie.service";
import MirrorService from "./api/mirror/mirror.service";
import Elios from "../elios/elios.controller";

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
        private mirrorService: MirrorService,
        private eliosController: Elios) {
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

        app.on('quit', () => {
            this.eliosController.quit();
            this.moduleService.stopAll();
        });

        // app.on('before-quit', () => {
        //     console.log('DDDDDDDDDDDDDDDDDD')
        // });

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
            fullscreen: process.env.NODE_ENV === 'development' ? false : true,
            show: false,
            frame: false,
            resizable: true,
            backgroundColor: '#000000',
            center: true,
            fullscreenable: true,
            webPreferences: {
                nodeIntegration: true // TODO : need to set false before V5.0.0 of electron !!!!!
            }
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

        let that = this;

        const menu = Menu.buildFromTemplate([
            {
                label: 'Menu',
                submenu: [
                    {
                        label: 'Reload Modules',
                        accelerator: 'CmdOrCtrl+R',
                        click() {
                            that.socketService.send('app.reload');
                        }
                    },
                    {
                        label: 'TEST',
                        accelerator: 'CmdOrCtrl+T',
                        click() {
                            that.socketService.send('test');
                        }
                    },
                    {
                        label: 'Dev Tools',
                        accelerator: 'CmdOrCtrl+Option+I',
                        click() {
                            that.mainWindow.toggleDevTools();
                        }
                    },
                    {
                        label: 'Exit',
                        accelerator: 'CmdOrCtrl+Q',
                        click() {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'Accounts',
                submenu: [
                    {
                        label: 'Logout Currect Account',
                        accelerator: 'CmdOrCtrl+P',
                        click() {
                        }
                    },
                    {
                        label: 'Logout All Accounts',
                        accelerator: 'CmdOrCtrl+Shift+P',
                        click() {

                        }
                    },
                    {
                        label: 'New Account',
                        accelerator: 'CmdOrCtrl+L',
                        click() {
                            that.authService.getConnected().then((authAccount) => {
                                const accounts = that.authService.getAccounts();
                                accounts.forEach((account) => {
                                    if (account.user.id !== authAccount.user.id) {
                                        that.authService.loginAs(account.user.id);
                                    }
                                });
                            });
                        }
                    },
                    {
                        label: 'New Account',
                        accelerator: 'CmdOrCtrl+N',
                        click() {
                            that.socketService.send('accounts.login');
                        }
                    }
                ]
            }
        ])
        Menu.setApplicationMenu(menu);

    }
}