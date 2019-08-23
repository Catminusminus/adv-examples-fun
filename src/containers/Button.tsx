import * as React from 'react'
import ButtonComponent from '../components/Button'
import * as tf from '@tensorflow/tfjs'

const createModel = () => {
  const model = tf.sequential()
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))
  model.add(
    tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    }),
  )
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))
  model.add(tf.layers.flatten())
  model.add(
    tf.layers.dense({
      units: 10,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax',
    }),
  )

  return model
}

const Button = () => {
  const [model, _] = React.useState(createModel())
  const BATCH_SIZE = 64
  const TRAIN_BATCHES = 150

  // Every few batches, test accuracy over many examples. Ideally, we'd compute
  // accuracy over the whole test set, but for performance we'll use a subset.
  const TEST_BATCH_SIZE = 1000
  const TEST_ITERATION_FREQUENCY = 5

  let data
  async function load() {
    data = new MnistData()
    await data.load()
  }

  useEffect(() => {
    const f = async () => {
      await new Promise(r => setTimeout(r, 1000))
      console.log('side effect!')
    }
    f()
  }, [])
}
