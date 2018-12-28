import ApiService from "./api.service";
import AuthService from "./auth/auth.service";
import UserServices from "./account/user/user.service";
import RegisterService from "./register/register.service";
import MirrorService from "./mirror/mirror.service";

export default [
    MirrorService,
    ApiService,
    AuthService,
    RegisterService,
    UserServices
]