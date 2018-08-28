import { MainInterface } from "electron";
import Di from "./main/di";

declare module "vue/types/vue" {

    interface Vue {
        $electron: MainInterface;
        $container: Di;
    }
}
