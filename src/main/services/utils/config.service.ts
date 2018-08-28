import {injectable} from "inversify";

interface ApiConfigDTO {
    address: string,
    client_id: number,
    client_secret: string
}

interface ConfigDTO {
    api: ApiConfigDTO
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