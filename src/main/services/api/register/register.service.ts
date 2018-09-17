import ApiService from "../api.service";
import {injectable} from "inversify";

interface RegisterDTO {
    status: string;
    message: string;
    id: string;
}


@injectable()
export default class RegisterService {


    constructor(private apiService: ApiService) {}

    register(): Promise<RegisterDTO> {
        return this.apiService.post('/api/mirrors', {
            name: 'Miroir de test'
        });
    }

}