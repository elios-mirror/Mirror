import LoggerService from "./services/utils/logger.service";
import AppService from "./services/app.service";
import ModuleService from "./services/module/module.service";
import CookieService from "./services/utils/cookie.service";
import Api from './services/api/api.module';
import ConfigService from "./services/utils/config.service";
import SocketService from "./services/utils/socket.service";
import SocketIoService from "./services/utils/socket-io.service";
import Elios from "./elios/elios.module";
import ContainerService from "./services/container/container.service"


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
    AppService,
    CookieService,
    ModuleService,
    ConfigService,
    ContainerService
]