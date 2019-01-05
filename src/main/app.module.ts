import LoggerService from "./services/utils/logger.service";
import AppService from "./services/app.service";
import ModuleService from "./services/module/module.service";
import GitService from "./services/module/git.service";
import CookieService from "./services/utils/cookie.service";
import LocalModuleService from "./services/module/local.module.service";
import Api from './services/api/api.module';
import ConfigService from "./services/utils/config.service";
import SocketService from "./services/utils/socket.service";
import SocketIoService from "./services/utils/socket-io.service";
import Elios from "./elios/elios.module";


/**
 * List of classes what you want to be autoInjectable
 *
 * Like angular DI
 *
 */
export default [
    Api,
    Elios,
    SocketIoService,
    LoggerService,
    SocketService,
    LocalModuleService,
    GitService,
    AppService,
    CookieService,
    ModuleService,
    ConfigService
]