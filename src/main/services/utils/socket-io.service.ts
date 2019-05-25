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
            'reconnectionAttempts': 10
        });
        this.socket.on('connect', function () {
            console.log('connected');
        });

        this.socket.on('disconnect', function () {
            console.log('disconnect');
        });
    }
}