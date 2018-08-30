import {injectable} from 'inversify';
import io from 'socket.io-client';
import ConfigService from "./config.service";

@injectable()
export default class SocketIoService {

    private socket: any;

    constructor(private configService: ConfigService) {
        this.socket = io(configService.get().api.address + ':4224');

        console.log('cc');

        this.socket.on('connect', () => {
            console.log('dcccc');
        });
    }


}