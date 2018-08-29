import Vue from "vue";
import AuthService from "../../main/services/api/auth/auth.service";
import UserService from "../../main/services/api/account/user/user.service";
import UserDTO, {CommunityDTO, ServerDTO} from "../../main/services/api/account/user/user.dto";
import SocketService from "../../main/services/utils/socket.service";
import Module from "./Layouts/Module.vue";
import ModuleService from "../../main/services/module/module.service";

const draggable = require('vuedraggable');

export default Vue.extend({
    name: "landing-page",
    components: {Module, draggable},
    data() {
        return {
            selectedCommunity: null as CommunityDTO | null,
            selectedCommunityPosition: "0px",
            selectedServer: null as ServerDTO | null,
            communities: [] as CommunityDTO[],
            cursorCommunity: null as CommunityDTO | null,
            cursorCommunityPosition: "0px",
        };
    },
    methods: {
        open(link: string) {
            this.$electron.shell.openExternal(link);
        },
        setSelectedCommunity(community: CommunityDTO | null) {
            if (community != this.selectedCommunity) {
                this.selectedServer = null;
                this.selectedCommunity = community;
                if (community) {
                    const pos = this.getCommunityPos(community);
                    this.selectedCommunityPosition = pos.y + 25 + "px";
                }
            }
        },
        setSelectedServer(server: ServerDTO) {
            this.selectedServer = server;
        },
        setCursorCommunity(community: CommunityDTO | null) {
            this.cursorCommunity = community;
            if (community) {
                const pos = this.getCommunityPos(community);
                this.cursorCommunityPosition = pos.y + 25 + "px";
            }
        },
        logout() {
            const authService = this.$container.get<AuthService>(AuthService.name);
            authService.logout();
            this.$router.push("/auth");
        },
        loading() {
            this.$router.push("/loading");
        },
        test() {
            const socketService = this.$container.get<SocketService>(SocketService.name);
            socketService.send('reload');
        },
        play(server: ServerDTO) {
            const moduleService = this.$container.get<ModuleService>(ModuleService.name);
            const module = moduleService.get(server.module.name, server.module.version);

            if (module) {
                module.start();
            }
        },
        startDrag(community: CommunityDTO) {
            if (community === this.selectedCommunity) {
                const el = document.querySelector(`.community[id="${community.id}"]`);
                el ? el.classList.remove('community-selected') : 0;
            }
            this.setCursorCommunity(null);
        },
        stopDrag(community: CommunityDTO) {

            if (community === this.selectedCommunity) {
                const el = document.querySelector(`.community[id="${community.id}"]`);
                el ? el.classList.add('community-selected') : 0;
            }
            this.setCursorCommunity(community);
        },
        getCommunityPos(community: CommunityDTO) {

            let el = document.querySelector(`.community[id="${community.id}"]`);
            if (el) {
                const offset = el.getBoundingClientRect();
                return {x: offset.left, y: offset.top};
            }
            return {x: 0, y: 0};

        }
    },
    created() {
        const userService = this.$container.get<UserService>(UserService.name);
        userService.get().then((res: UserDTO) => {
            console.log(res);
            this.communities = [];
            for (let community of res.communities) {
                this.communities.push(community);
            }
        });


        const socketService = this.$container.get<SocketService>(SocketService.name);
        const sub = socketService.on('reload').subscribe(() => {
            sub.unsubscribe();
            this.$router.push('/loading');
        });
    }
});