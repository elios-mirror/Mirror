import { injectable } from "inversify";
import ApiService from "../api.service";
import LoginDto from "./login.dto";
import ConfigService from "../../utils/config.service";
import CookieService from "../../utils/cookie.service";
import UserService from "../account/user/user.service";
import ModuleService from "../../module/module.service";
import UserDTO from "../account/user/user.dto";

@injectable()
export default class AuthService {
  private isAuth: boolean = false;
  private isReload: boolean = false;

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private cookieService: CookieService,
    private userService: UserService,
    private moduleService: ModuleService
  ) {
    if (cookieService.has("access_token")) {
      this.userService.get().then(() => {
        this.isAuth = true;
      });
    }
  }

  login(login: string, password: string) {
    return this.apiService
      .post<LoginDto>("/oauth/token", {
        grant_type: "password",
        client_id: this.configService.get().api.client_id,
        client_secret: this.configService.get().api.client_secret,
        username: login,
        password: password,
        scope: "*"
      })
      .then(res => {
        this.cookieService.set("access_token", res.access_token);
        this.cookieService.set("refresh_token", res.access_token);
        this.isAuth = true;
        return res;
      });
  }

  logout() {
    this.moduleService.clear();
    this.isAuth = false;
    this.cookieService.delete("access_token");
    this.cookieService.delete("refresh_token");
  }

  loadModules() {
    this.isReload = true;
    return new Promise((resolve, reject) => {
      this.userService
        .get()
        .then((res: UserDTO) => {
          const communities = res.communities;

          for (let community of communities) {
            const servers = community.servers;

            for (let server of servers) {
              const module = server.module;
              this.moduleService.add({
                commit: module.commit,
                repository: module.repository,
                version: module.version
              });
            }
          }

          this.moduleService.loadAll().then(() => {
            this.isReload = false;
            resolve();
          });
        })
        .catch(err => {
            this.isReload = false;
            reject(err);
        });
    });
  }

  isAuthenticated(): boolean {
    return this.isAuth;
  }

  canReload(): boolean {
    return this.isReload === false;
  }


}
