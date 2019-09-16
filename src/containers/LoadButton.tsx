import * as React from 'react'
import Button from '../components/Button'
import { State, StateStage } from '../modules'
import { useDispatch, useSelector } from 'react-redux'

const dataStateSelector = (state: State) => state.dataState

const LoadButton = () => {
  const dataState = useSelector(dataStateSelector)
  const dispatch = useDispatch()

  return (
    <Button
      loading={dataState === StateStage.working}
      disabled={false}
      onClick={() => {
        dispatch({
          type: 'LOAD_DATA',
        })
      }}
      success={dataState === StateStage.end}
      message="Load Data"
      successMessage="Data Loaded"
    />
  )
}

export default LoadButton
