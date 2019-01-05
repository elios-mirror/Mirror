import {injectable} from "inversify";
import {Subject} from 'rxjs';

@injectable()
export default class SocketService {

    private sockets: Map<string, Subject<any>> = new Map<string, Subject<any>>();

    send(channel: string, data: {} = '') {
        if (this.sockets.has(channel)) {
            const socket = this.sockets.get(channel);
            if (socket) {
                socket.next(data);
            }
        }
    }

    on<T>(channel: string): Subject<T> {
        let socket;

        if (this.sockets.has(channel)) {
            socket = this.sockets.get(channel);
            if (socket) {
                return socket;
            }
        }
        socket = new Subject<any>();

        this.sockets.set(channel, socket);
        return socket;
    }


}