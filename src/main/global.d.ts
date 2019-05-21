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

declare module 'socket.io-client';
declare module 'melanke-watchjs';
declare module 'elios-protocol';