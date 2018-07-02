/**
 * Declare global variables
 */

declare namespace NodeJS {
    import BrowserWindow = Electron.BrowserWindow;



    export interface Global {
        __static: string,
        version: string,
        mainWindow: BrowserWindow,
        container: any,
    }
}