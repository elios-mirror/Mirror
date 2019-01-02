import { injectable } from 'inversify';
import AccountService from '../api/account/account.service';
import * as cv from 'opencv4nodejs';
import * as fr from 'face-recognition';

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

  intvl: any = null;
  cap: any = cv.Mat;


  /**
   * Settings 
   */
  private unknownThreshold = 0.6;
  private minDetections = 5;

  constructor(private accountService: AccountService) {
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
  }

  start() {
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
      const faceRects = this.detectFaces(frameResized, 150);
      if (faceRects.length) {
        // draw detection
        faceRects.forEach((det: any) => {
          const { rect, face } = det;
          const cvFace = new fr.CvImage(face);
          const prediction = this.recognizer.predictBest(fr.cvImageToImageRGB(cvFace), this.unknownThreshold);
          if (prediction.className != 'unknown' && prediction.className != connected) {
            console.log(prediction);
            connected = prediction.className;
          } else if (prediction.className != 'unknown' && prediction.className == connected) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              connected = null;
              console.log("disconneted", connected);
            }, 10000);
          }
          // const text = `${prediction.className} (${prediction.distance})`
          // const blue = new cv.Vec3(255, 0, 0);
          // drawRectWithText(frameResized, rect, text, blue)
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

  drawRectWithText(image: any, rect: cv.Rect, text: string, color: cv.Vec) {
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