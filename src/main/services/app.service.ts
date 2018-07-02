import {injectable} from "inversify";
import {app, BrowserWindow, webFrame} from 'electron';
import ModuleService, {IModuleRepository} from './module/module.service';
import LoggerService from "./utils/logger.service";
import AuthService from "./api/auth/auth.service";
import UserService from "./api/account/user/user.service";

/**
 * We need to find alternative
 * I think is not beautiful
 *
 * @type {string}
 */
const winUrl = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

global.version = require('../../../package.json').version;

@injectable()
export default class AppService {

    private mainWindow: any;

    constructor(private moduleService: ModuleService, private loggerService: LoggerService, private authService: AuthService,
                private userService: UserService) {
        this.loggerService.debug('Starting App in version: ' + global.version);
    }

    /**
     * Initialize electron handlers
     */
    start() {
        app.on('ready', () => {
            this.createWindow();
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

        //this.mainWindow.openDevTools();

        global.mainWindow = this.mainWindow;

        this.mainWindow.loadURL(winUrl);

        this.mainWindow.once('ready-to-show', () => {

            this.mainWindow.show();

            this.authService.loadModules().then(() => {
                this.startApp();
            }).catch(() => {
                this.startApp();
            });
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });


    }

    startApp() {
        this.mainWindow.setSize(1000, 600);
        this.mainWindow.center();
        this.mainWindow.setMinimumSize(1000, 600);
        this.mainWindow.setResizable(true);
        this.mainWindow.setFullScreenable(true);

        this.mainWindow.webContents.send('loading_message', {message: 'Starting...'});
        if (this.authService.isAuthenticated()) {
            this.userService.get().then(res => {
                this.mainWindow.webContents.send('loading_message', {message: 'Welcome back <font color="#FF8A65"> ' + res.name + ' </font>'})
            });
        }
        setTimeout(() => {
            this.mainWindow.webContents.send('loading_finished', {});
        }, 3000);
    }
}