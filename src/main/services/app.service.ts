import {injectable} from "inversify";
import {app, BrowserWindow, webFrame, globalShortcut} from 'electron';
import ModuleService from './module/module.service';
import LoggerService from "./utils/logger.service";
import AuthService from "./api/auth/auth.service";
import UserService from "./api/account/user/user.service";
import SocketService from "./utils/socket.service";
import RegisterService from "./api/register/register.service";
import CookieService from "./utils/cookie.service";

global.version = require('../../../package.json').version;

@injectable()
export default class AppService {

    private winUrl: string = process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`;

    private mainWindow: any;

    constructor(private moduleService: ModuleService, private loggerService: LoggerService, private authService: AuthService,
                private userService: UserService, private socketService: SocketService, private registerService: RegisterService, private cookieService: CookieService) {
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


        if (!this.cookieService.has('id')) {
            this.registerMirror().then(() => {

            });
        }

        this.socketService.on('loadModules').subscribe(() => {
            this.moduleService.clear();
            this.moduleService.loadOrReloadDevModules();
            if (this.authService.canReload()) {
                this.authService.loadModules().then(() => {
                    this.startApp();
                }).catch(() => {
                    this.startApp();
                });
            }
        });
    }

    registerMirror() {
        return new Promise(resolve => {
            this.registerService.register().then((res) => {
                this.cookieService.set('id', res.id);
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
            fullscreen: true,
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

            this.startApp();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    startApp() {
        this.socketService.send('loading', {action: 'message', message: 'DEMARAGE'});
        if (this.authService.isAuthenticated()) {
            this.userService.get().then(res => {
                this.socketService.send('loading', {
                    action: 'message',
                    message: 'Bienvenue <font color="#FF8A65"> ' + res.name + ' </font>'
                });
            });
        }
        setTimeout(() => {
            this.socketService.send('loading', {action: 'finished'});
        }, 1500);
    }



    registerShortcuts() {

        globalShortcut.register('CommandOrControl+R', () => {
            this.socketService.send('reload');
        });

        globalShortcut.register('CommandOrControl+T', () => {
            this.mainWindow.openDevTools();
        });


    }
}