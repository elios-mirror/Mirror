import Vue from 'vue'
import AccountService, { AccountDTO } from "../../../main/services/api/account/account.service";
import CookieService from '../../../main/services/utils/cookie.service';
import SocketIoService from "../../../main/services/utils/socket-io.service";
import UserDTO from "../../../main/services/api/account/user/user.dto";

interface LinkedDTO {
    access_token: string;
    user: UserDTO;
}

export default Vue.extend({
    data() {
        return {
            mirrorId: '',
            accounts: [] as AccountDTO[],
            accountService: this.$container.get<AccountService>(AccountService.name)
        }
    },
    methods: {
        loginAs(account: AccountDTO) {
            this.accountService.loginAs(account.user.id);
        }
    },
    beforeMount() {
        const cookieService = this.$container.get<CookieService>(CookieService.name);
        const socketIoService = this.$container.get<SocketIoService>(SocketIoService.name);

        if (cookieService.has('id')) {
            this.mirrorId = cookieService.get('id')
        }
        this.accountService.getAccounts().forEach((account) => {
            this.accounts.push(account);
        });
        socketIoService.socket.on(`linked_${this.mirrorId}`, (data: LinkedDTO) => {
            this.accountService.add(data.user, data.access_token);
            this.$router.push('/loading');
        });
    }

});
