import Vue from 'vue'
import {remote} from 'electron'
import AuthService from "../../../../main/services/api/auth/auth.service";


export default Vue.extend({
    data() {
        return {
            login: "",
            password: "",
            wave: true,
            isLoading: false,
            errors: {
                login: '',
                password: ''
            }
        }
    },
    methods: {
        submit: function () {
            this.errors = {
                login: '',
                password: ''
            };
            const authService = this.$container.get<AuthService>(AuthService.name);
            this.isLoading = true;
            authService.login(this.login, this.password).then(() => {
                this.wave = false;
                this.isLoading = false;
                setTimeout(() => {
                    this.$router.push('/loading');
                    authService.loadModules().then(() => {
                        this.$router.push('/home');
                    }).catch(() => {
                        this.$router.push('/login');
                    });
                }, 1050);
            }).catch((err) => {
                this.isLoading = false;
                if (err && err.response && err.response.data) {
                    this.errors.login = err.response.data.message;
                } else {
                    this.errors.login = 'An error occurred, please check your connexion';
                    console.log(err);
                }
            });
        }
    },

    mounted() {
        const authService = this.$container.get<AuthService>(AuthService.name);

        if (authService.isAuthenticated()) {
            this.$router.push('/home');
            return;
        }
        this.wave = true;
    }

});
