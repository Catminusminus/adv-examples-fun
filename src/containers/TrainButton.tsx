import * as React from 'react'
import Button from '../components/Button'
import { State, StateStage } from '../modules'
import { useDispatch, useSelector } from 'react-redux-worker'

const modelStateSelector = (state: State) => state.modelState
const dataStateSelector = (state: State) => state.dataState

const TrainButton = () => {
  const modelState = useSelector(modelStateSelector)
  const dataState = useSelector(dataStateSelector)
  const dispatch = useDispatch()

  return (
    <Button
      loading={modelState === StateStage.working}
      disabled={dataState !== StateStage.end}
      onClick={() => {
        dispatch({
          type: 'TRAIN_MODEL',
        })
      }}
      success={modelState === StateStage.end}
      message="Train Model"
      successMessage="Training End"
    />
  )
}

export default TrainButton
