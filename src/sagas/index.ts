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

import { all, put, takeEvery, call } from 'redux-saga/effects'
import { MnistData } from '../utils/data'
import { createModel } from '../utils/model'
import {
  setDataState,
  setModelState,
  setPredicateState,
  setData,
  setModel,
  setLoss,
  setAcc,
  setImage,
  setPerturbation,
  setAdvImage,
  predictImage,
  trainModel as trainModelAction,
} from '../modules/actions'
import { StateStage } from '../modules'
import * as tf from '@tensorflow/tfjs'
import { Dispatch } from 'redux'

const train = async (
  data: MnistData,
  dispatch: Dispatch<any>,
  model: tf.Sequential,
  onIteration?: any,
) => {
  const batchSize = 320
  const validationSplit = 0.15
  const trainEpochs = 1
  const trainData = data.getTrainData()

  await model.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationSplit,
    epochs: trainEpochs,
    callbacks: {
      onBatchEnd: async (batch: any, logs: any) => {
        // eslint-disable-next-line no-console
        console.log(`batchend loss:${logs.loss} acc:${logs.acc}`)
        dispatch(setLoss(logs.loss))
        dispatch(setAcc(logs.acc))
        if (onIteration && batch % 10 === 0) {
          onIteration('onBatchEnd', batch, logs)
        }
        await tf.nextFrame()
      },
      onEpochEnd: async () => {
        // eslint-disable-next-line no-console
        console.log('epochend')
      },
    },
  })
}

const selectAccurateExample = (labels: number[], predictions: number[]) => {
  const indices = labels.map((v, i) => predictions[i] === v)
  const accIndices = labels.map((v, i) => i).filter(index => indices[index])

  return accIndices
}

const formatImage = (image: tf.Tensor<tf.Rank>) => {
  const [width, height] = [28, 28]

  const cnv = document.createElement('canvas')
  cnv.width = width * 3
  cnv.height = height * 3
  const ctx = cnv.getContext('2d') as CanvasRenderingContext2D

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
  const ctxBig = cnv.getContext('2d') as CanvasRenderingContext2D
  ctxBig.scale(3, 3)
  ctxBig.drawImage(cnv, 0, 0)

  return cnv
}

const deepFoolAttack = (
  image: tf.Tensor<tf.Rank>,
  model: tf.Sequential,
  axis: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: any,
) => {
  const x0 = image
  const xArr = [x0]
  const rArr = []
  const kHatX0 = Array.from(
    (model.predict(xArr[0]) as tf.Tensor<tf.Rank>).argMax(axis).dataSync(),
  )[0]
  for (let i = 0; i < 10; i++) {
    const kHatXI = Array.from(
      (model.predict(xArr[i]) as tf.Tensor<tf.Rank>).argMax(axis).dataSync(),
    )[0]
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
        Array.from(
          fKArr[i]
            .abs()
            .div(v.norm().add(tf.scalar(0.1)))
            .dataSync(),
        )[0],
    )
    const coef = tf.tensor1d(coefArr).argMax()
    const rI = tf
      .tensor1d(coefArr)
      .max()
      .mul(
        wKArr[Array.from(coef.dataSync())[0]].div(
          wKArr[Array.from(coef.dataSync())[0]].norm(),
        ),
      )
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
  model: tf.Sequential,
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
  model: tf.Sequential,
  axis: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loss: any,
) => {
  const l = Array.from(
    (model.predict(image) as tf.Tensor<tf.Rank>).argMax(axis).dataSync(),
  )[0]
  const dArr = []
  const xArr = [image]
  const f = (x: any) =>
    (model.predict(x) as tf.Tensor<tf.Rank>)
      .flatten()
      .gather(tf.tensor1d([l], 'int32'))
  for (let i = 0; i < 50; i++) {
    if (
      (model.predict(image) as tf.Tensor<tf.Rank>).argMax(axis) ===
      (model.predict(xArr[i]) as tf.Tensor<tf.Rank>).argMax(axis)
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
    model: tf.Sequential,
    axis: number,
    loss: any,
  ) => tf.Tensor<tf.Rank>
} = {
  DeepFool: deepFoolAttack,
  FGSM: fgsmAttack,
  NewtonFool: newtonFoolAttack,
}

async function showPrediction(
  data: MnistData,
  dispatch: Dispatch<any>,
  model: tf.Sequential,
  attack: string,
) {
  const testExamples = 100
  const examples = data.getTestData(testExamples)
  tf.tidy(() => {
    const output = model.predict(examples.xs) as tf.Tensor<tf.Rank>
    const axis = 1
    const labels = Array.from(examples.labels.argMax(axis).dataSync())
    const predictions = Array.from(output.argMax(axis).dataSync())
    const accIndices = selectAccurateExample(labels, predictions)
    const index = accIndices[Math.floor(Math.random() * accIndices.length)]
    dispatch(
      setImage(
        formatImage(
          examples.xs.slice([index, 0], [1, examples.xs.shape[1]]).flatten(),
        ),
        predictions[index],
        index,
      ),
    )
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
    const predictionsAdv = Array.from(outputAdv.argMax(axis).dataSync())
    dispatch(setPerturbation(formatImage(perturbation.flatten())))
    dispatch(
      setAdvImage(
        formatImage(perturbation.add(image).flatten()),
        predictionsAdv[0],
        attack,
      ),
    )
  })
}

function* loadData() {
  yield all([
    put(setDataState(StateStage.working)),
    put(setModelState(StateStage.init)),
    put(setPredicateState(StateStage.init)),
  ])
  const data = new MnistData()
  yield call(data.load)
  yield all([put(setData(data)), put(setDataState(StateStage.end))])
}

function* trainModel(action: ReturnType<typeof trainModelAction>) {
  yield all([put(setModelState(StateStage.working))])
  const model = createModel()
  yield call(train, action.payload.data, action.payload.dispatch, model)
  yield all([put(setModel(model)), put(setModelState(StateStage.end))])
}

function* predict(action: ReturnType<typeof predictImage>) {
  yield all([put(setPredicateState(StateStage.working))])
  yield call(
    showPrediction,
    action.payload.data,
    action.payload.dispatch,
    action.payload.model,
    action.payload.attack,
  )
  yield all([put(setPredicateState(StateStage.end))])
}

export default function* rootSaga() {
  yield takeEvery('LOAD_DATA', loadData)
  yield takeEvery('TRAIN_MODEL', trainModel)
  yield takeEvery('PREDICT', predict)
}
