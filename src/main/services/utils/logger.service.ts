import {injectable} from "inversify";

const fs = require('fs');

/**
 * Logger class for beautiful logs <3
 */
@injectable()
export default class LoggerService {
    constructor() {
    }

    /**
     * Debug in console or log
     *
     * @param {string} msg
     */
    debug(msg: string) {
        console.log(msg);
        //fs.appendFile('12.logs', msg + '\n');
    }
}