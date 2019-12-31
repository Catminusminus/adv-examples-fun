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
} from '../modules/actions'
import { StateStage } from '../modules'
import * as tf from '@tensorflow/tfjs'

const train = async (
  data: any,
  dispatch: any,
  model: any,
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

const selectAccurateExample = (labels: any[], predictions: any[]) => {
  const indices = labels.map((v, i) => predictions[i] === v)
  const accIndices = labels.map((v, i) => i).filter(index => indices[index])

  return accIndices
}

const formatImage = (image: any) => {
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

async function showPrediction(data: any, dispatch: any, model: any) {
  const testExamples = 100
  const examples = data.getTestData(testExamples)
  tf.tidy(() => {
    const output = model.predict(examples.xs)
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
    const loss = (input: any) =>
      tf.metrics.categoricalCrossentropy(
        examples.labels.slice([index, 0], [1, examples.labels.shape[1]]),
        model.predict(input),
      )
    const grad = tf.grad(loss)
    const signedGrad = tf.sign(grad(image))
    const scalar = tf.scalar(0.3, 'float32')

    const outputAdv = model.predict(signedGrad.mul(scalar).add(image))
    const predictionsAdv = Array.from(outputAdv.argMax(axis).dataSync())
    dispatch(setPerturbation(formatImage(signedGrad.flatten())))
    dispatch(
      setAdvImage(
        formatImage(
          signedGrad
            .mul(scalar)
            .add(image)
            .flatten(),
        ),
        predictionsAdv[0],
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

function* trainModel(action: any) {
  yield all([put(setModelState(StateStage.working))])
  const model = createModel()
  yield call(train, action.payload.data, action.payload.dispatch, model)
  yield all([put(setModel(model)), put(setModelState(StateStage.end))])
}

function* predict(action: any) {
  yield all([put(setPredicateState(StateStage.working))])
  yield call(
    showPrediction,
    action.payload.data,
    action.payload.dispatch,
    action.payload.model,
  )
  yield all([put(setPredicateState(StateStage.end))])
}

export default function* rootSaga() {
  yield takeEvery('LOAD_DATA', loadData)
  yield takeEvery('TRAIN_MODEL', trainModel)
  yield takeEvery('PREDICT', predict)
}
