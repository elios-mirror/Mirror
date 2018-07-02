import {injectable} from "inversify";
import ApiCoreService from "../../api-core.service";
import UserDTO from "./user.dto";

@injectable()
export default class UserService {
    constructor(private apiCoreService: ApiCoreService) {}

    get() {
        return this.apiCoreService.get<UserDTO>('/api/user');
    }
}