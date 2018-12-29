import ApiService from "./api.service";
import AccountService from "./account/account.service";
import UserServices from "./account/user/user.service";
import MirrorService from "./mirror/mirror.service";

export default [
    MirrorService,
    ApiService,
    AccountService,
    UserServices
]