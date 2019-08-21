import * as React from 'react'
import Button from '../components/Button'
import * as tf from '@tensorflow/tfjs'
import {IMAGE_H, IMAGE_W, MnistData} from '../utils/data';
import { setData } from '../modules'
import { useDispatch } from 'react-redux'

const TrainButton = () => {
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const dispatch = useDispatch()
  const onClick = () => {
    const loadData = async () => {
      setLoading(true)
      const data = new MnistData()
      await data.load()
      dispatch(setData(data))
      setSuccess(true)
      setLoading(false)
    }
    loadData()
  }
  return <Button loading={loading} onClick={onClick} success={success} message='Train Model' successMessage='Training End' />
}

export default TrainButton
