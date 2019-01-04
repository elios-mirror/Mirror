import Vue from "vue";
import SocketService from "../../../main/services/utils/socket.service";
import FaceRecognitionService from '../../../main/services/faceid/facerecognition.service';

var canvas = document.getElementById('canvas-video') as any;
if (canvas) {
    var context = canvas.getContext('2d');

}
var img = new Image();

export default Vue.extend({
    name: "faceid-page",
    components: {
    },
    data() {
        return {
            camera: '',
            faceRecognitionService: this.$container.get<FaceRecognitionService>(FaceRecognitionService.name),
            htmlFaceId: null
        };
    },
    mounted() {
        const socketService = this.$container.get<SocketService>(SocketService.name);
        this.faceRecognitionService.test();


        socketService.on('faceid.face').subscribe((data: any) => {
            this.htmlFaceId = data.html;
        });
    },
    beforeDestroy() {
        this.faceRecognitionService.stop();

    },
    methods: {
    }
});