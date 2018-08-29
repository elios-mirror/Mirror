import Vue from 'vue'
import AuthService from "../../../main/services/api/auth/auth.service";
import CookieService from '../../../main/services/utils/cookie.service';

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

        if (authService.isAuthenticated()) {
            this.$router.push('/home');
            return;
        }

        if (cookieService.has('id')) {
            this.mirrorId = cookieService.get('id')
        }
    }

});
