import Vue from "vue";
import SocketService from "../../main/services/utils/socket.service";
import ModuleService from "../../main/services/module/module.service";

const fs = require('fs');
const path = require('path');

export default Vue.extend({
    name: 'loading-page',

    data() {
        return {
            message: 'Chargement..',
            socketService: this.$container.get<SocketService>(SocketService.name),
            moduleService: this.$container.get<ModuleService>(ModuleService.name),
        }
    },

    mounted() {


        this.socketService.send('loadModules');

        const sub = this.socketService.on('loading').subscribe((data) => {
            switch (data.action) {
                case 'init_module':
                    this.message = 'Chargement du module <b>' + data.module + '</b>...';
                    break;
                case 'message':
                    this.message = data.message;
                    break;
                case 'finished':
                    sub.unsubscribe();
                    this.$router.push('/auth');
                    break;
            }
        });


    }
});