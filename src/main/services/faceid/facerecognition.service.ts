import { injectable } from 'inversify';
import AccountService from '../api/account/account.service';
const path = require('path')
const fs = require('fs')
const cv = require('opencv4nodejs')
const fr = require('face-recognition').withCv(cv)

const trainedModelFile = 'faceRecognition2Model_101.json'
const facesPath = path.resolve('faces')
const trainedModelFilePath = path.resolve('./', trainedModelFile)


@injectable()
export default class FaceRecognitionService {
    private detector = fr.FaceDetector();
    private recognizer = fr.FaceRecognizer()
    private classNames = ['leo', 'remi'];

    intvl: any = null;
    cap: any = null;

    constructor(private accountService: AccountService) {
    }

    start() {

        if (!fs.existsSync(trainedModelFilePath)) {
            console.log('%s not found, start training recognizer...', trainedModelFile)
            const allFiles = fs.readdirSync(facesPath)
            const imagesByClass = this.classNames.map(c =>
                allFiles
                    .filter((f: any) => f.includes(c))
                    .map((f: any) => path.join(facesPath, f))
                    .map((fp: any) => fr.loadImage(fp))
            )

            imagesByClass.forEach((faces, label) =>
                this.recognizer.addFaces(faces, this.classNames[label]))

            fs.writeFileSync(trainedModelFilePath, JSON.stringify(this.recognizer.serialize()));
        } else {
            console.log('found %s, loading model', trainedModelFile);

            this.recognizer.load(eval(`require('${trainedModelFilePath.split('\\').join('/')}');`))

            console.log('imported the following descriptors:')
            console.log(this.recognizer.getDescriptorState())
        }
        const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        const minDetections = 5
        const unknownThreshold = 0.6


        function detectFaces(img: any, faceSize: any) {
            const { objects, numDetections } = classifier.detectMultiScale(img.bgrToGray())
            return objects
                .filter((_: any, i: any) => minDetections <= numDetections[i])
                .map((rect: any) => ({
                    rect,
                    face: img.getRegion(rect).resize(faceSize, faceSize)
                }))
        }

        function drawRectWithText(image: any, rect: any, text: any, color: any) {
            const thickness = 1
            image.drawRectangle(
                new cv.Point(rect.x, rect.y),
                new cv.Point(rect.x + rect.width, rect.y + rect.height),
                color,
                cv.LINE_8,
                thickness
            )

            const textOffsetY = rect.height + 20
            image.putText(
                text,
                new cv.Point(rect.x, rect.y + textOffsetY),
                cv.FONT_ITALIC,
                0.6,
                color,
                thickness
            )
        }


        let connected = null as any;

        let timeout = null as any;



        this.cap = new cv.VideoCapture(0);
        this.intvl = setInterval(() => {
            let frame = this.cap.read();
            // loop back to start on end of stream reached
            if (frame.empty) {
                this.cap.reset();
                frame = this.cap.read();
            }
            const frameResized = frame.resizeToMax(800);

            // detect faces
            const faceRects = detectFaces(frameResized, 150);
            if (faceRects.length) {
                // draw detection
                faceRects.forEach((det: any) => {
                    const { rect, face } = det
                    console.log(connected);
                    const cvFace = fr.CvImage(face)
                    const prediction = this.recognizer.predictBest(cvFace, unknownThreshold)
                    if (prediction.className != 'unknown' && prediction.className != connected) {
                        console.log(prediction);
                        connected = prediction.className;
                    } else if (prediction.className != 'unknown' && prediction.className == connected) {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            connected = null;
                            console.log("disconneted");
                        }, 10000);
                    }
                    const text = `${prediction.className} (${prediction.distance})`
                    const blue = new cv.Vec(255, 0, 0)
                    //drawRectWithText(frameResized, rect, text, blue)
                });
            }

            //cv.imshow('face detection', frameResized);


        }, 500);
    }

    stop() {
        if (this.intvl)
            clearInterval(this.intvl);
        this.cap.release();
    }
} 