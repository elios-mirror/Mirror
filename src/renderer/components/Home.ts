import Vue from "vue";
import SocketService from "../../main/services/utils/socket.service";
import Module from "./Layouts/Module.vue";

const draggable = require('vuedraggable');

export default Vue.extend({
    name: "landing-page",
    components: {Module, draggable},
    data() {
        return {};
    },
    methods: {

    },
    created() {
        const socketService = this.$container.get<SocketService>(SocketService.name);
        const sub = socketService.on('reload').subscribe(() => {
            sub.unsubscribe();
            this.$router.push('/loading');
        });
    }
});