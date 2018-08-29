import Vue from 'vue'
import {remote} from 'electron'
import AuthService from "../../../main/services/api/auth/auth.service";

export default Vue.extend({
    data() {
        return {
            isLoading: false,
        }
    },
    methods: {

    },
    beforeMount() {
        const authService = this.$container.get<AuthService>(AuthService.name);

        if (authService.isAuthenticated()) {
            this.$router.push('/home');
            return;
        }
    }

});
