import * as React from 'react'
import Button from '../components/Button'
import { State, ActionType } from '../modules'
import { useDispatch, useSelector } from 'react-redux'

const dataLoadingSelector = (state: State) => state.dataLoding
const dataLoadedSelector = (state: State) => state.dataLoaded

const LoadButton = () => {
  const dataLoading = useSelector(dataLoadingSelector)
  const dataLoaded = useSelector(dataLoadedSelector)
  const dispatch = useDispatch()

  return (
    <Button
      loading={dataLoading}
      onClick={() => {
        dispatch({
          type: 'LOAD_DATA',
        })
      }}
      success={dataLoaded}
      message="Load Data"
      successMessage="Data Loaded"
    />
  )
}

export default LoadButton
