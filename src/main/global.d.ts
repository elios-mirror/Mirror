/**
 * Declare global variables
 */

declare namespace NodeJS {

    export interface Global {
        __static: string,
        version: string,
        container: any,
    }
}

declare var __static: string;
