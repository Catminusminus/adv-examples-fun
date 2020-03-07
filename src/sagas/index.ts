/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/**
 * Modified by Catminusminus
 */

import { all, put, takeEvery, call, take, fork } from 'redux-saga/effects'
import { MnistData } from '../utils/data'
import { createModel } from '../utils/model'
import {
  setDataState,
  setModelState,
  setPredicateState,
  setLoss,
  setAcc,
  setImage,
  setPerturbation,
  setAdvImage,
  predictImage,
} from '../modules/actions'
import { StateStage } from '../modules'
import * as tf from '@tensorflow/tfjs'
import { eventChannel } from 'redux-saga'
import EventEmitter from 'events'

function* setLossAndAccChannel(lossAndAcc: any) {
  const chan = eventChannel(emitter => {
    lossAndAcc.on('logs', (logs: any) => emitter(logs))

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {}
  })
  while (true) {
    const { loss, acc } = yield take(chan)
    yield all([put(setLoss(loss)), put(setAcc(acc))])
  }
}

function* generalPutChannel(general: any, msg: string) {
  const chan = eventChannel(emitter => {
    general.on(msg, (action: any) => emitter(action))

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {}
  })
  while (true) {
    const action = yield take(chan)
    yield put(action)
  }
}

const putChannel = (msg: string) => (general: any) =>
  generalPutChannel(general, msg)

const emitter = new EventEmitter()

export class Model {
  data: MnistData
  model: tf.Sequential
  constructor() {
    this.data = new MnistData()
    this.model = createModel()
  }

  getTestData(numExamples: number) {
    return this.data.getTestData(numExamples)
  }

  predict(arg: any) {
    return this.model.predict(arg)
  }

  async load() {
    // eslint-disable-next-line no-console
    console.log('loading data...')
    await this.data.load()
  }

  async train() {
    const batchSize = 320
    const validationSplit = 0.15
    const trainEpochs = 1
    const trainData = this.data.getTrainData()
    // eslint-disable-next-line no-console
    console.log('model training start...')

    await this.model.fit(trainData.xs, trainData.labels, {
      batchSize,
      validationSplit,
      epochs: trainEpochs,
      callbacks: {
        onBatchEnd: async (batch: any, logs: any) => {
          emitter.emit('logs', logs)
          // eslint-disable-next-line no-console
          console.log(`batchend loss:${logs.loss} acc:${logs.acc}`)
        },
        onEpochEnd: async () => {
          // eslint-disable-next-line no-console
          console.log('epochend')
        },
      },
    })
  }
}

const model = new Model()

const selectAccurateExample = (labels: number[], predictions: number[]) => {
  const indices = labels.map((v, i) => predictions[i] === v)
  const accIndices = labels.map((v, i) => i).filter(index => indices[index])

  return accIndices
}

const formatImage = (image: tf.Tensor<tf.Rank>, canvas: OffscreenCanvas) => {
  const [width, height] = [28, 28]
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
  const imageData = ctx.createImageData(width, height)
  const data = image.dataSync()
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4
    imageData.data[j + 0] = data[i] * 255
    imageData.data[j + 1] = data[i] * 255
    imageData.data[j + 2] = data[i] * 255
    imageData.data[j + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
  const ctxBig = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
  ctxBig.scale(3, 3)
  ctxBig.drawImage(canvas, 0, 0)
}

const deepFoolAttack = (
  image: tf.Tensor<tf.Rank>,
  model: Model,
  axis: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: any,
) => {
  const x0 = image
  const xArr = [x0]
  const rArr = []
  const kHatX0 = (model.predict(xArr[0]) as tf.Tensor<tf.Rank>)
    .argMax(axis)
    .dataSync()[0]
  for (let i = 0; i < 10; i++) {
    const kHatXI = (model.predict(xArr[i]) as tf.Tensor<tf.Rank>)
      .argMax(axis)
      .dataSync()[0]
    if (kHatX0 !== kHatXI) {
      break
    }
    const wKArr: any[] = []
    const fKArr: any[] = []
    for (let k = 0; k < 10; k++) {
      if (k === kHatX0) {
        continue
      }
      const fK = (x: any) =>
        (model.predict(x) as tf.Tensor<tf.Rank>)
          .flatten()
          .gather(tf.tensor1d([k], 'int32'))
      const fK0 = (x: any) =>
        (model.predict(x) as tf.Tensor<tf.Rank>)
          .flatten()
          .gather(tf.tensor1d([kHatX0], 'int32'))
      const wKP = tf
        .grad(fK)(xArr[i])
        .sub(tf.grad(fK0)(xArr[i]))
      wKArr.push(wKP)
      const fKP = (model.predict(xArr[i]) as tf.Tensor<tf.Rank>)
        .flatten()
        .gather(tf.tensor1d([k], 'int32'))
        .sub(
          (model.predict(xArr[i]) as tf.Tensor<tf.Rank>)
            .flatten()
            .gather(tf.tensor1d([kHatX0], 'int32')),
        )
      fKArr.push(fKP)
    }
    const coefArr: any[] = wKArr.map(
      (v, i) =>
        fKArr[i]
          .abs()
          .div(v.norm().add(tf.scalar(0.1)))
          .dataSync()[0],
    )
    const coef = tf.tensor1d(coefArr).argMax()
    const rI = tf
      .tensor1d(coefArr)
      .max()
      .mul(wKArr[coef.dataSync()[0]].div(wKArr[coef.dataSync()[0]].norm()))
    rArr.push(rI)
    xArr.push(xArr[i].add(rI))
  }
  const reducer_ = (
    accumulator: tf.Tensor<tf.Rank>,
    currentValue: tf.Tensor<tf.Rank>,
  ) => accumulator.add(currentValue)
  const perturbation = rArr.reduce(reducer_)

  return perturbation
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fgsmAttack = (
  image: tf.Tensor<tf.Rank>,
  model: Model,
  axis: number,
  loss: any,
) => {
  const grad = tf.grad(loss)
  const signedGrad = tf.sign(grad(image))
  const scalar = tf.scalar(0.3, 'float32')

  return signedGrad.mul(scalar)
}

const newtonFoolAttack = (
  image: tf.Tensor<tf.Rank>,
  model: Model,
  axis: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loss: any,
) => {
  const l = (model.predict(image) as tf.Tensor<tf.Rank>)
    .argMax(axis)
    .dataSync()[0]
  const dArr = []
  const xArr = [image]
  const f = (x: any) =>
    (model.predict(x) as tf.Tensor<tf.Rank>)
      .flatten()
      .gather(tf.tensor1d([l], 'int32'))
  for (let i = 0; i < 50; i++) {
    if (
      (model.predict(xArr[i]) as tf.Tensor<tf.Rank>)
        .argMax(axis)
        .dataSync()[0] !== l
    ) {
      break
    }
    const delta = tf.minimum(
      tf
        .scalar(0.01)
        .mul(image.norm())
        .mul(
          tf
            .grad(f)(xArr[i])
            .norm(),
        ),
      (model.predict(xArr[i]) as tf.Tensor<tf.Rank>).max().sub(tf.scalar(0.1)),
    )
    const dI = delta
      .mul(tf.grad(f)(xArr[i]))
      .div(
        tf
          .grad(f)(xArr[i])
          .norm()
          .pow(tf.scalar(2).toInt()),
      )
      .mul(tf.scalar(-1))
    xArr.push(xArr[i].add(dI))
    dArr.push(dI)
  }
  const reducer_ = (
    accumulator: tf.Tensor<tf.Rank>,
    currentValue: tf.Tensor<tf.Rank>,
  ) => accumulator.add(currentValue)
  const perturbation = dArr.reduce(reducer_)

  return perturbation
}

const adversarialAttackDict: {
  [index: string]: (
    image: tf.Tensor<tf.Rank>,
    model: Model,
    axis: number,
    loss: any,
  ) => tf.Tensor<tf.Rank>
} = {
  DeepFool: deepFoolAttack,
  FGSM: fgsmAttack,
  NewtonFool: newtonFoolAttack,
}

async function showPrediction(
  attack: string,
  originCanvas: OffscreenCanvas,
  perturbationCanvas: OffscreenCanvas,
  advCanvas: OffscreenCanvas,
) {
  const testExamples = 100
  const examples = model.getTestData(testExamples)
  tf.tidy(() => {
    const output = model.predict(examples.xs) as tf.Tensor<tf.Rank>
    const axis = 1
    const labels = Array.from(examples.labels.argMax(axis).dataSync())
    const predictions = Array.from(output.argMax(axis).dataSync())
    const accIndices = selectAccurateExample(labels, predictions)
    const index = accIndices[Math.floor(Math.random() * accIndices.length)]
    formatImage(
      examples.xs.slice([index, 0], [1, examples.xs.shape[1]]).flatten(),
      originCanvas,
    )
    emitter.emit('put', setImage(predictions[index], index))
    const image = examples.xs.slice([index, 0], [1, examples.xs.shape[1]])
    const loss = (input: tf.Tensor<tf.Rank>) =>
      tf.metrics.categoricalCrossentropy(
        examples.labels.slice([index, 0], [1, examples.labels.shape[1]]),
        model.predict(input) as tf.Tensor<tf.Rank>,
      )
    const perturbation = adversarialAttackDict[attack](image, model, axis, loss)
    const outputAdv = model.predict(perturbation.add(image)) as tf.Tensor<
      tf.Rank
    >
    const predictionsAdv = outputAdv.argMax(axis).dataSync()
    formatImage(perturbation.flatten(), perturbationCanvas)
    emitter.emit('put2', setPerturbation())
    formatImage(perturbation.add(image).flatten(), advCanvas)
    emitter.emit('put3', setAdvImage(predictionsAdv[0], attack))
  })
}

const loadFunc = async (model: any) => {
  await model.load()
}
const trainFunc = async (model: any) => {
  await model.train()
}

function* loadData() {
  yield all([
    put(setDataState(StateStage.working)),
    put(setModelState(StateStage.init)),
    put(setPredicateState(StateStage.init)),
  ])
  yield call(loadFunc, model)
  yield put(setDataState(StateStage.end))
}

function* trainModel() {
  yield all([put(setModelState(StateStage.working))])
  yield call(trainFunc, model)
  yield put(setModelState(StateStage.end))
}

function* predict(action: ReturnType<typeof predictImage>) {
  // eslint-disable-next-line no-console
  console.log('generating...')
  yield all([put(setPredicateState(StateStage.working))])
  yield call(
    showPrediction,
    action.payload.attack,
    action.payload.originCanvas,
    action.payload.perturbationCanvas,
    action.payload.advCanvas,
  )
  yield all([put(setPredicateState(StateStage.end))])
}

export default function* rootSaga() {
  yield takeEvery('LOAD_DATA', loadData)
  yield takeEvery('TRAIN_MODEL', trainModel)
  yield takeEvery('PREDICT', predict)
  yield fork(setLossAndAccChannel, emitter)
  yield fork(putChannel('put'), emitter)
  yield fork(putChannel('put2'), emitter)
  yield fork(putChannel('put3'), emitter)
}
