import Vue from "vue";
import SocketService from "../../main/services/utils/socket.service";
import AccountService from "../../main/services/api/account/account.service";
import ModuleService from '../../main/services/module/module.service';

export default Vue.extend({
    name: 'loading-page',

    data() {
        return {
            socketSub: null as any,
            message: 'Chargement..',
            moduleService: this.$container.get<ModuleService>(ModuleService.name),
            socketService: this.$container.get<SocketService>(SocketService.name),
            accountService: this.$container.get<AccountService>(AccountService.name)
        }
    },

    mounted() {
        if (this.accountService.isAuthenticated()) {
            this.moduleService.clear();
            this.accountService.loadModules().then().catch((err) => console.log(err));
        }

        this.socketSub = this.socketService.on('modules.install.start').subscribe((data: any) => {
            this.message = `Installation of ${data.module.name}-${data.module.version}  |  ${data.stats.current} / ${data.stats.total}`;
        });

        const sub = this.socketService.on('modules.load.end').subscribe((data) => {
            sub.unsubscribe();
            this.$router.push('/home');
        });

    },
    beforeDestroy() {
        this.socketSub.unsubscribe();
    }
});