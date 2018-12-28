import ApiService from "../api.service";
import {injectable} from "inversify";
import ConfigService from '../../utils/config.service';
import config from "../../../../../config/config";

interface RegisterDTO {
    status: string;
    message: string;
    id: string;
}


@injectable()
export default class RegisterService {


    constructor(private apiService: ApiService, private configService: ConfigService) {}

    register(): Promise<RegisterDTO> {
        return this.apiService.post('/api/mirrors', {
            model: this.configService.get().model
        });
    }

}