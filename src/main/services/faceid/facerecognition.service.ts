import { injectable } from 'inversify';
import AccountService from '../api/account/account.service';
import * as cv from 'opencv4nodejs';
import * as fr from 'face-recognition';
import SocketService from '../utils/socket.service';

const path = require('path')
const fs = require('fs')

const trainedModelFile = 'faceRecognition2Model_101.json'
const facesPath = path.resolve('faces')
const trainedModelFilePath = path.resolve('./', trainedModelFile)


@injectable()
export default class FaceRecognitionService {
  private detector = fr.FaceDetector();
  private recognizer = fr.FaceRecognizer()
  private classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
  private classNames = ['leo'];

  private intvl: any = null;
  private cap: cv.VideoCapture | null = null;

  private connected = null as string | null;



  /**
   * Settings 
   */
  private unknownThreshold = 0.6;
  private minDetections = 5;

  constructor(private accountService: AccountService, private socketService: SocketService) {
    fr.withCv(cv);
    this.init();
  }


  private detectFaces(img: cv.Mat, faceSize: number) {
    const { objects, numDetections } = this.classifier.detectMultiScale(img.bgrToGray())
    return objects
      .filter((_: any, i: number) => this.minDetections <= numDetections[i])
      .map((rect: cv.Rect) => ({
        rect,
        face: img.getRegion(rect).resize(faceSize, faceSize)
      }))
  }

  private init() {
    if (fs.existsSync(trainedModelFilePath)) {
      console.log('found %s, loading model', trainedModelFile);

      this.recognizer.load(eval(`require('${trainedModelFilePath.split('\\').join('/')}');`))

      console.log('imported the following descriptors:')
      console.log(this.recognizer.getDescriptorState())
    }
  }

  addFace() {
    this.cap = new cv.VideoCapture(0);
    let frame = this.cap.read();
    // loop back to start on end of stream reached
    if (frame.empty) {
      this.cap.reset();
      frame = this.cap.read();
    }

    const frameResized = frame.resizeToMax(800);
    const faceRects = this.detectFaces(frameResized, 150);
    if (faceRects.length) {
      faceRects.forEach((det) => {
        const cvFace = new fr.CvImage(det.face);
        this.recognizer.addFaces([fr.cvImageToImageRGB(cvFace)], 'remi')
      })
    }
    this.stop();
  }

  start() {

    let timeout = null as any;


    this.cap = new cv.VideoCapture(0);
    this.intvl = setInterval(() => {
      if (!this.cap) {
        return;
      }
      let frame = this.cap.read();
      // loop back to start on end of stream reached
      if (frame.empty) {
        this.cap.reset();
        frame = this.cap.read();
      }
      const frameResized = frame.resizeToMax(800);

      // detect faces
      const faceRects = this.detectFaces(frameResized, 150);
      if (faceRects.length) {
        // draw detection
        faceRects.forEach((det) => {
          const { rect, face } = det;
          const cvFace = new fr.CvImage(face);
          const prediction = this.recognizer.predictBest(fr.cvImageToImageRGB(cvFace), this.unknownThreshold);
          if (prediction.className != 'unknown' && prediction.className != this.connected) {
            console.log(prediction);
            this.connected = prediction.className;
          } else if (prediction.className != 'unknown' && prediction.className == this.connected) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.connected = null;
              console.log("disconneted", this.connected);
            }, 10000);
          }
          const text = `${prediction.className} (${prediction.distance})`
          const blue = new cv.Vec3(255, 0, 0);
          this.drawRectWithText(frameResized, rect, text, blue)
          const outBase64 = cv.imencode('.jpg', frameResized).toString('base64');
          const htmlImg = '<img src=data:image/jpeg;base64,' + outBase64 + '>';
          this.socketService.send('faceid.face', { html: htmlImg });
        });
      }

      // cv.imshow('face detection', frameResized);

    }, 500);
  }

  stop() {
    if (this.intvl)
      clearInterval(this.intvl);
    if (this.cap)
      this.cap.release();
    this.cap = null;
  }

  /**
   * Debug draw functions 
   */

  private drawRectWithText(image: any, rect: cv.Rect, text: string, color: cv.Vec) {
    const thickness = 1;
    image.drawRectangle(
      new cv.Point2(rect.x, rect.y),
      new cv.Point2(rect.x + rect.width, rect.y + rect.height),
      color,
      cv.LINE_8,
      thickness
    )

    const textOffsetY = rect.height + 20
    image.putText(
      text,
      new cv.Point2(rect.x, rect.y + textOffsetY),
      cv.FONT_ITALIC,
      0.6,
      color,
      thickness
    )
  }
} 