import {injectable} from "inversify";
import ApiService from "../../api.service";
import UserDTO from "./user.dto";

@injectable()
export default class UserService {
    constructor(private apiService: ApiService) {}

    get() {
        return this.apiService.get<UserDTO>('/api/user');
    }
}