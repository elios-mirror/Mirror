import Vue from "vue";
import SocketService from "../../main/services/utils/socket.service";
import {remote} from 'electron';

const fs = require('fs');
const path = require('path');

export default Vue.extend({
    name: 'loading-page',

    data() {
        return {
            title: 'Chargement des modules...',
            message: 'Chargement..',
            loadingsImg: [],
            socketService: this.$container.get<SocketService>(SocketService.name),
        }
    },

    mounted() {

        // List all loadingImg in /static/loadings
        fs.readdirSync(path.join(__static, '/loadings')).forEach((file: never) => {
            this.loadingsImg.push(file);
        });

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