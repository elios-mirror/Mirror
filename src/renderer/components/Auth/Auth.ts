import Vue from 'vue'
import AccountService from "../../../main/services/api/account/account.service";
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
            isLoading: false,
        }
    },
    methods: {

        login: function () {
            this.$router.push('/home');
        }

    },
    beforeMount() {
        const accountService = this.$container.get<AccountService>(AccountService.name);
        const cookieService = this.$container.get<CookieService>(CookieService.name);
        const socketIoService = this.$container.get<SocketIoService>(SocketIoService.name);

        if (accountService.isAuthenticated()) {
            this.$router.push('/home');
            return;
        }

        if (cookieService.has('id')) {
            this.mirrorId = cookieService.get('id')
        }

        socketIoService.socket.on(`linked_${this.mirrorId}`, (data: LinkedDTO) => {
            accountService.add(data.user.id, data.access_token);
            this.$router.push('/loading');
        });
    }

});
