import {injectable} from "inversify";
import {app} from 'electron';
import LoggerService from "./logger.service";

const fs = require('fs');

@injectable()
export default class CookieService {

    cookieFile: string = 'cookies.json';
    cookies: any = {};

    constructor (private loggerService: LoggerService) {
        this.loggerService.debug('AppData is here ' + this.getAppData())
        if (!fs.existsSync(this.getCookieFilePath())) {
            this.loggerService.debug('Create cookies file.');
            fs.createWriteStream(this.getCookieFilePath());
            this.save()
        } else {
            this.loggerService.debug('Load cookies file.');
            this.cookies = fs.readFileSync(this.getCookieFilePath());
            this.cookies = JSON.parse(this.cookies)
        }
    }

    /**
     * Get file of cookies
     *
     * @returns {string}
     */
    private getCookieFilePath() {
        if (process.env.NODE_ENV === "development") {
            return ('./' + this.cookieFile);
        } else {
            return (this.getAppData() + this.cookieFile);
        }
    }

    /**
     * Get appData path
     * @returns {string}
     */
    private getAppData() {
        return (app.getPath('userData'));
    }

    /**
     * Set cookie
     *
     * @param {string} key
     * @param {string} value
     */
    set (key: string, value: any) {
        this.cookies[key] = value;
        this.save();
    }

    /**
     * Get cookie value
     *
     * @param {string} key
     * @returns {any}
     */
    get (key: string) {
        if (this.cookies[key]) { return this.cookies[key] } else { return null }
    }

    /**
     * Check cookie value exist
     *
     * @param {string} key
     * @returns {boolean}
     */
    has (key: string) {
        return !!this.cookies[key];
    }

    /**
     * Delete value in cookie
     *
     * @param {string} key
     */
    delete (key: string) {
        if (this.cookies[key]) {
            delete this.cookies[key];
            this.save()
        }
    }

    /**
     * Save cookies in file
     */
    save () {
        fs.writeFileSync(this.getCookieFilePath(), JSON.stringify(this.cookies))
    }
}
