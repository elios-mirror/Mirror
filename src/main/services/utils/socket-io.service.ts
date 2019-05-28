import { injectable } from 'inversify';
import io from 'socket.io-client';
import ConfigService from "./config.service";

@injectable()
export default class SocketIoService {

    readonly socket: any;

    constructor(private configService: ConfigService) {
        this.socket = io(configService.get().sockets.address + ':' + configService.get().sockets.port, {
            'reconnection': true,
            'reconnectionDelay': 500,
            'reconnectionAttempts': 10,
            'pingTimeout': 30000
        });
        this.socket.on('connect', () => {
            console.log('connected');
        });

        this.socket.on('error', (err: any) => {
            console.error('error ' + err);
        });
        
        this.socket.on('disconnect', (reason: any) => {
            console.log('disconnect ' + reason);
            this.socket.open();
        });
    }
}