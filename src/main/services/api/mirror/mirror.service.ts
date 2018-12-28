import { injectable } from "inversify";
import ApiService from "../api.service";
import CookieService from '../../utils/cookie.service';

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
}

export interface MirrorDTO {
    id: string;
    name: string;
    model: string;
    modules: ModuleVersionDTO[];
}

@injectable()
export default class MirrorService {
    constructor(private apiService: ApiService, private cookieService: CookieService) { }

    get(): Promise<MirrorDTO> {
        const mirrorId = this.cookieService.get('id');
        return this.apiService.get<MirrorDTO>(`/api/mirrors/${mirrorId}`);
    }
}