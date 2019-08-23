import * as React from 'react'
import Button from '../components/Button'
import { State, ActionType } from '../modules'
import { useDispatch, useSelector } from 'react-redux'

const modelTrainingSelector = (state: State) => state.modelTraining
const modelTrainedSelector = (state: State) => state.modelTrained
const modelDataSelector = (state: State) => state.data

const TrainButton = () => {
  const modelTraining = useSelector(modelTrainingSelector)
  const modelTrained = useSelector(modelTrainedSelector)
  const data = useSelector(modelDataSelector)
  const dispatch = useDispatch()

  return (
    <Button
      loading={modelTraining}
      onClick={() => {
        dispatch({
          type: ActionType.TRAIN_MODEL,
          payload: {
            data,
          },
        })
      }}
      success={modelTrained}
      message="Train Model"
      successMessage="Training End"
    />
  )
}

export default TrainButton
