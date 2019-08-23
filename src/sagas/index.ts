import { put, takeEvery, call } from 'redux-saga/effects'
import { MnistData } from '../utils/data'
import { createModel } from '../utils/model'
import {
  ActionType,
  setDataLoading,
  setModelTraining,
  setData,
  setModel,
  setDataLoaded,
  setModelTrained,
  setLoss,
  setAcc,
} from '../modules'

const train = async (data: any, model: any, onIteration?: any) => {
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
  const trainEpochs = 10

  // We'll keep a buffer of loss and accuracy values over time.
  let trainBatchCount = 0

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
        put(setLoss(logs.loss))
        put(setAcc(logs.acc))
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
      },
    },
  })

  // const testResult = model.evaluate(testData.xs, testData.labels)
  // const testAccPercent = testResult[1].dataSync()[0] * 100
  // const finalValAccPercent = valAcc * 100
}

function* loadData() {
  yield put(setDataLoaded(false))
  yield put(setModelTrained(false))
  yield put(setDataLoading(true))
  const data = new MnistData()
  yield call(data.load)
  yield put(setData(data))
  yield put(setDataLoading(false))
  yield put(setDataLoaded(true))
}

function* trainModel(action: any) {
  yield put(setModelTrained(false))
  yield put(setModelTraining(true))
  const model = createModel()
  yield call(train, action.payload.data, model)
  yield setModel(model)
  yield put(setModelTrained(true))
}

export default function* rootSaga() {
  yield takeEvery(ActionType.LOAD_DATA, loadData)
  yield takeEvery(ActionType.TRAIN_MODEL, trainModel)
}
