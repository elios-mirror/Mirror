import { MainInterface } from "electron";
import Di from "./main/di";

declare module "vue/types/vue" {

    interface Vue {
        readonly $electron: MainInterface;
        readonly $container: Di;
    }
}
