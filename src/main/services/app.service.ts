import {injectable} from "inversify";
import {app, BrowserWindow, webFrame, globalShortcut} from 'electron';
import ModuleService from './module/module.service';
import LoggerService from "./utils/logger.service";
import AuthService from "./api/auth/auth.service";
import UserService from "./api/account/user/user.service";
import SocketService from "./utils/socket.service";

global.version = require('../../../package.json').version;

@injectable()
export default class AppService {

    private winUrl: string = process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`;

    private mainWindow: any;

    constructor(private moduleService: ModuleService, private loggerService: LoggerService, private authService: AuthService,
                private userService: UserService, private socketService: SocketService) {
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

        this.socketService.on('loadModules').subscribe(() => {
            if (this.authService.canReload()) {
                this.authService.loadModules().then(() => {
                    this.startApp();
                }).catch(() => {
                    this.startApp();
                });
            }
        });

    }

    /**
     * Create the mainWindow of your app
     */
    createWindow() {

        this.mainWindow = new BrowserWindow({
            width: 350,
            height: 400,
            show: false,
            frame: false,
            resizable: false,
            backgroundColor: '#2C2F33',
            center: true,
            fullscreenable: false
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

            this.initApp();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    initApp() {
        this.mainWindow.setSize(1000, 600);
        this.mainWindow.center();
        this.mainWindow.setMinimumSize(1000, 600);
        this.mainWindow.setResizable(true);
        this.mainWindow.setFullScreenable(true);

        this.startApp();
    }

    startApp() {
        this.socketService.send('loading', {action: 'message', message: 'Starting...'});
        if (this.authService.isAuthenticated()) {
            this.userService.get().then(res => {
                this.socketService.send('loading', {action: 'message', message: 'Welcome back <font color="#FF8A65"> ' + res.name + ' </font>'});
            });
        }
        setTimeout(() => {
            this.socketService.send('loading', {action: 'finished'});
        }, 2000);
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