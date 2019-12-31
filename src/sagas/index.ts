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
  predictImage,
  setPerturbation,
  setAdvImage,
} from '../modules/actions'
import { StateStage } from '../modules'
import * as tf from '@tensorflow/tfjs'
import * as Konva from 'konva'

const train = async (
  data: any,
  dispatch: any,
  model: any,
  onIteration?: any,
) => {
  // Batch size is another important hyperparameter. It defines the number of
  // examples we group together, or batch, between updates to the model's
  // weights during training. A value that is too low will update weights using
  // too few examples and will not generalize well. Larger batch sizes require
  // more memory resources and aren't guaranteed to perform better.
  const batchSize = 320

  // Leave out the last 15% of the training data for validation, to monitor
  // overfitting during training.
  const validationSplit = 0.15

  // Get number of training epochs from the UI.
  const trainEpochs = 1

  // We'll keep a buffer of loss and accuracy values over time.
  let trainBatchCount = 0

  console.log(data)

  const trainData = data.getTrainData()
  const testData = data.getTestData()

  const totalNumBatches =
    Math.ceil((trainData.xs.shape[0] * (1 - validationSplit)) / batchSize) *
    trainEpochs

  // During the long-running fit() call for model training, we include
  // callbacks, so that we can plot the loss and accuracy values in the page
  // as the training progresses.
  let valAcc
  await model.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationSplit,
    epochs: trainEpochs,
    callbacks: {
      onBatchEnd: async (batch: any, logs: any) => {
        trainBatchCount++
        /** ui.logStatus(
          `Training... (` +
            `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
            ` complete). To stop training, refresh or close page.`,
        ) */
        console.log(`batchend loss:${logs.loss} acc:${logs.acc}`)
        dispatch(setLoss(logs.loss))
        dispatch(setAcc(logs.acc))
        // ui.plotLoss(trainBatchCount, logs.loss, 'train')
        // ui.plotAccuracy(trainBatchCount, logs.acc, 'train')
        if (onIteration && batch % 10 === 0) {
          onIteration('onBatchEnd', batch, logs)
        }
        await tf.nextFrame()
      },
      onEpochEnd: async (epoch: any, logs: any) => {
        /**
        valAcc = logs.val_acc
        ui.plotLoss(trainBatchCount, logs.val_loss, 'validation')
        ui.plotAccuracy(trainBatchCount, logs.val_acc, 'validation')
        if (onIteration) {
          onIteration('onEpochEnd', epoch, logs)
        }
        await tf.nextFrame()
        */
        console.log('epochend')
      },
    },
  })

  // const testResult = model.evaluate(testData.xs, testData.labels)
  // const testAccPercent = testResult[1].dataSync()[0] * 100
  // const finalValAccPercent = valAcc * 100
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
  console.log(imageData)
  // return imageData
  // return new Konva.Image({ image: imageData })
  ctx.putImageData(imageData, 0, 0)
  const ctxBig = cnv.getContext('2d') as CanvasRenderingContext2D
  ctxBig.scale(3, 3)
  // ctxBig.putImageData(imageData, 0, 0)
  // return createImageBitmap(imageData)
  ctxBig.drawImage(cnv, 0, 0)

  return cnv
}

async function showPrediction(data: any, dispatch: any, model: any) {
  const testExamples = 100
  const examples = data.getTestData(testExamples)

  // Code wrapped in a tf.tidy() function callback will have their tensors freed
  // from GPU memory after execution without having to call dispose().
  // The tf.tidy callback runs synchronously.
  tf.tidy(() => {
    const output = model.predict(examples.xs)

    // tf.argMax() returns the indices of the maximum values in the tensor along
    // a specific axis. Categorical classification tasks like this one often
    // represent classes as one-hot vectors. One-hot vectors are 1D vectors with
    // one element for each output class. All values in the vector are 0
    // except for one, which has a value of 1 (e.g. [0, 0, 0, 1, 0]). The
    // output from model.predict() will be a probability distribution, so we use
    // argMax to get the index of the vector element that has the highest
    // probability. This is our prediction.
    // (e.g. argmax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
    // dataSync() synchronously downloads the tf.tensor values from the GPU so
    // that we can use them in our normal CPU JavaScript code
    // (for a non-blocking version of this function, use data()).
    const axis = 1
    const labels = Array.from(examples.labels.argMax(axis).dataSync())
    const predictions = Array.from(output.argMax(axis).dataSync())
    console.log(labels)
    console.log(predictions)
    const accIndices = selectAccurateExample(labels, predictions)
    const index = accIndices[Math.floor(Math.random() * accIndices.length)]
    console.log(index)
    // dispatch(setImage(bitmap, predictions[index]))
    dispatch(
      setImage(
        formatImage(
          examples.xs.slice([index, 0], [1, examples.xs.shape[1]]).flatten(),
        ),
        predictions[index],
        index,
      ),
    )
    // ui.showTestResults(examples, predictions, labels);
    const image = examples.xs.slice([index, 0], [1, examples.xs.shape[1]])
    const loss = (input: any) =>
      tf.metrics.categoricalCrossentropy(
        examples.labels.slice([index, 0], [1, examples.labels.shape[1]]),
        model.predict(input),
      )
    const grad = tf.grad(loss)
    const signed_grad = tf.sign(grad(image))
    const scalar = tf.scalar(0.3, 'float32')

    const output_adv = model.predict(signed_grad.mul(scalar).add(image))
    const predictions_adv = Array.from(output_adv.argMax(axis).dataSync())
    console.log(signed_grad)
    console.log(image)
    console.log(signed_grad.add(image))
    signed_grad.print()
    dispatch(setPerturbation(formatImage(signed_grad.flatten())))
    dispatch(
      setAdvImage(
        formatImage(
          signed_grad
            .mul(scalar)
            .add(image)
            .flatten(),
        ),
        predictions_adv[0],
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
  // yield put(predictImage(action.payload.data, action.payload.dispatch, model))
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

const makePerturbation = async (
  data: any,
  dispatch: any,
  label: any,
  index: any,
  model: any,
) => {
  const testExamples = 100
  const examples = data.getTestData(testExamples)
  tf.tidy(() => {
    // tf.argMax() returns the indices of the maximum values in the tensor along
    // a specific axis. Categorical classification tasks like this one often
    // represent classes as one-hot vectors. One-hot vectors are 1D vectors with
    // one element for each output class. All values in the vector are 0
    // except for one, which has a value of 1 (e.g. [0, 0, 0, 1, 0]). The
    // output from model.predict() will be a probability distribution, so we use
    // argMax to get the index of the vector element that has the highest
    // probability. This is our prediction.
    // (e.g. argmax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
    // dataSync() synchronously downloads the tf.tensor values from the GPU so
    // that we can use them in our normal CPU JavaScript code
    // (for a non-blocking version of this function, use data()).
    const axis = 1

    const image = examples.xs.slice([index, 0], [1, examples.xs.shape[1]])
    const loss = (input: any) =>
      tf.metrics.categoricalCrossentropy(label, model.predict(input))
    const grad = tf.grad(loss)
    const signed_grad = tf.sign(grad(image))
    const output = model.predict(image)
    const predictions = Array.from(output.argMax(axis).dataSync())

    dispatch(setPerturbation(formatImage(signed_grad.flatten())))
    dispatch(
      setAdvImage(formatImage((signed_grad + image).flatten()), predictions[0]),
    )
    // ui.showTestResults(examples, predictions, labels);
  })
}

export default function* rootSaga() {
  yield takeEvery('LOAD_DATA', loadData)
  yield takeEvery('TRAIN_MODEL', trainModel)
  yield takeEvery('PREDICT', predict)
}
