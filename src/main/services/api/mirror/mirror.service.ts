import { injectable } from "inversify";
import ApiService from "../api.service";
import ConfigService from '../../utils/config.service';

export interface ModuleDTO {
    id: string;
    title: string;
    name: string;
    repository: string;
    description: string;
    publisher_id: string;
}

export interface ModuleVersionDTO {
    id: string;
    commit: string;
    version: string;
    changelog: string;
    module_id: string;
    module: ModuleDTO;
    link: {
        link_id: string;
        module_id: string;
        id: string;
    }
}

export interface MirrorDTO {
    id: string;
    name: string;
    model: string;
    modules: ModuleVersionDTO[];
}

export interface RegisterDTO {
    status: string;
    message: string;
    id: string;
    access_token: string;
}

@injectable()
export default class MirrorService {
    constructor(private apiService: ApiService, private configService: ConfigService, ) { }

    get(): Promise<MirrorDTO> {
        return this.apiService.get<MirrorDTO>(`/api/mirror`, {}, true).catch((err) => {
            console.log(err);
            throw err;
        });
    }

    getModules(userId: string): Promise<ModuleVersionDTO[]> {
        return this.apiService.get<ModuleVersionDTO[]>(`/api/mirror/users/${userId}/modules`, {}, true);
    }

    register(): Promise<RegisterDTO> {
        return this.apiService.post('/api/mirrors', {
            model: this.configService.get().model
        });
    }
}