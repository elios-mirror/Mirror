import {injectable} from "inversify";

interface ApiConfigDTO {
    address: string,
    client_id: number,
    client_secret: string
}

interface SocketsConfigDTO {
    address: string;
    port: string;
}

interface ConfigDTO {
    api: ApiConfigDTO,
    sockets: SocketsConfigDTO,
    model: String,
}

/**
 * App config class service
 */
@injectable()
export default class ConfigService {

    private config: ConfigDTO;

    constructor() {
        this.config = require('../../../../config/config').default;
    }

    get(): ConfigDTO {
        return this.config;
    }
}