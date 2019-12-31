import * as React from 'react'
import Button from '../components/Button'
import { State, StateStage } from '../modules'
import { predictImage } from '../modules/actions'
import { useDispatch, useSelector } from 'react-redux'
import AdvImage from '../components/AdvImage'

const modelSelector = (state: State) => state.model
const modelDataSelector = (state: State) => state.data
const modelStateSelector = (state: State) => state.modelState
const predicteStateSelector = (state: State) => state.predicateState
const advSelector = (state: State) => state.advImage
const perturbationSelector = (state: State) => state.perturbation
const imageSelector = (state: State) => state.accImage

const GenButton = () => {
  const model = useSelector(modelSelector)
  const data = useSelector(modelDataSelector)
  const modelState = useSelector(modelStateSelector)
  const predicateState = useSelector(predicteStateSelector)
  const { image: advImage, label: advLabel } = useSelector(advSelector)
  const perturbation = useSelector(perturbationSelector)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { image, label, index: _ } = useSelector(imageSelector)

  const dispatch = useDispatch()

  return (
    <>
      <Button
        loading={predicateState === StateStage.working}
        disabled={modelState !== StateStage.end}
        onClick={() => {
          dispatch(predictImage(data, dispatch, model))
        }}
        success={predicateState === StateStage.end}
        message="Generate Adversarial Examples"
        successMessage="Generated. Try again?"
      />
      {predicateState === StateStage.end && (
        <AdvImage
          image={image}
          perturbation={perturbation}
          advImage={advImage}
          label={label}
          advLabel={advLabel}
        />
      )}
    </>
  )
}

export default GenButton
