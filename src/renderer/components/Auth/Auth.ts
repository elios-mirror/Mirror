import Vue from 'vue'
import AccountService, { AccountDTO } from "../../../main/services/api/account/account.service";
import CookieService from '../../../main/services/utils/cookie.service';
import SocketIoService from "../../../main/services/utils/socket-io.service";
import UserDTO from "../../../main/services/api/account/user/user.dto";
import FaceRecognitionService from '../../../main/services/faceid/facerecognition.service';
import SocketService from '../../../main/services/utils/socket.service';

interface LinkedDTO {
    access_token: string;
    user: UserDTO;
}

export default Vue.extend({
    data() {
        return {
            mirrorId: '',
            accounts: [] as AccountDTO[],
            accountService: this.$container.get<AccountService>(AccountService.name),
            faceRecognitionService: this.$container.get<FaceRecognitionService>(FaceRecognitionService.name),
            htmlFaceId: null
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
        const socketService = this.$container.get<SocketService>(SocketService.name);

        if (cookieService.has('id')) {
            this.mirrorId = cookieService.get('id')
        }
        this.accountService.getAccounts().forEach((account) => {
            this.accounts.push(account);
        });

        socketService.on('faceid.face').subscribe((data: any) => {
            this.htmlFaceId = data.html;
        });
        socketIoService.socket.on(`linked_${this.mirrorId}`, (data: LinkedDTO) => {
            this.accountService.add(data.user, data.access_token);
            this.$router.push('/loading');
        });
    },
    mounted() {
        this.faceRecognitionService.start();
    },
    beforeDestroy() {
        this.faceRecognitionService.stop();
    }

});
