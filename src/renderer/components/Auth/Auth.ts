import Vue from 'vue'
import AuthService from "../../../main/services/api/auth/auth.service";
import CookieService from '../../../main/services/utils/cookie.service';
import SocketIoService from "../../../main/services/utils/socket-io.service";

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
        const authService = this.$container.get<AuthService>(AuthService.name);
        const cookieService = this.$container.get<CookieService>(CookieService.name);
        const socketIoService = this.$container.get<SocketIoService>(SocketIoService.name);

        if (authService.isAuthenticated()) {
            this.$router.push('/home');
            return;
        }

        if (cookieService.has('id')) {
            this.mirrorId = cookieService.get('id')
        }



        socketIoService.socket.on(`linked_${this.mirrorId}`, () => {
            this.$router.push('/home');
        })
    }

});
