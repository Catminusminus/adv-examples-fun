import * as React from 'react'
import Button from '../components/Button'
import { State, StateStage } from '../modules'
import { predictImage } from '../modules/actions'
import { useDispatch, useSelector } from 'react-redux'
import AdvImage from '../components/AdvImage'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { useWindowResize } from 'beautiful-react-hooks'

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      minWidth: 120,
    },
  }),
)

const modelSelector = (state: State) => state.model
const modelDataSelector = (state: State) => state.data
const modelStateSelector = (state: State) => state.modelState
const predicteStateSelector = (state: State) => state.predicateState
const advSelector = (state: State) => state.advImage
const perturbationSelector = (state: State) => state.perturbation
const imageSelector = (state: State) => state.accImage

const GenButton = () => {
  const classes = useStyles()
  const model = useSelector(modelSelector)
  const data = useSelector(modelDataSelector)
  const modelState = useSelector(modelStateSelector)
  const predicateState = useSelector(predicteStateSelector)
  const { image: advImage, label: advLabel, attack: advAttack } = useSelector(
    advSelector,
  )
  const perturbation = useSelector(perturbationSelector)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { image, label, index: _ } = useSelector(imageSelector)
  const [attack, setAttack] = React.useState('FGSM')
  const dispatch = useDispatch()
  const inputLabel = React.useRef<HTMLLabelElement>(null)
  const [labelWidth, setLabelWidth] = React.useState(0)
  const [width, setWidth] = React.useState(window.innerWidth * 0.8)
  const [height, setHeight] = React.useState(window.innerHeight / 2)

  useWindowResize(() => {
    setWidth(window.innerWidth * 0.8)
    setHeight(window.innerHeight / 2)
  })
  React.useEffect(() => {
    setLabelWidth((inputLabel.current as HTMLLabelElement).offsetWidth)
  }, [])

  return (
    <>
      <FormControl
        variant="outlined"
        className={classes.formControl}
        disabled={modelState !== StateStage.end}
      >
        <InputLabel ref={inputLabel} id="select-outlined-label">
          Attack
        </InputLabel>
        <Select
          labelId="select-outlined-label"
          id="select-outlined"
          value={attack}
          onChange={e => setAttack(e.target.value as string)}
          labelWidth={labelWidth}
        >
          <MenuItem value="FGSM">FGSM</MenuItem>
          <MenuItem value="DeepFool">DeepFool</MenuItem>
        </Select>
      </FormControl>
      <Button
        loading={predicateState === StateStage.working}
        disabled={modelState !== StateStage.end}
        onClick={() => {
          data && model && dispatch(predictImage(data, dispatch, model, attack))
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
          advAttack={advAttack}
          width={width}
          height={height}
        />
      )}
    </>
  )
}

export default GenButton
