import * as React from 'react'
import Button from '../components/Button'
import { State, StateStage } from '../modules'
import { predictImage } from '../modules/actions'
import { useDispatch, useSelector } from 'react-redux-worker'
import AdvImage from '../components/AdvImage'
import Loading from '../components/Loading'
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

const modelStateSelector = (state: State) => state.modelState
const predicteStateSelector = (state: State) => state.predicateState
const advSelector = (state: State) => state.advImage
const imageSelector = (state: State) => state.accImage

const useOffscreenCanvas = (
  width: number,
  height: number,
  canvasToBeRemaked: boolean,
  setCanvasToBeRemaked: React.Dispatch<any>,
) => {
  const ref = React.useRef<HTMLCanvasElement>()

  React.useEffect(() => {
    if (canvasToBeRemaked) {
      ref.current = document.createElement('canvas')
      ref.current.width = width * 3
      ref.current.height = height * 3
      setCanvasToBeRemaked(false)
    }
  }, [width, height, canvasToBeRemaked])

  return ref.current
}

const GenButton = () => {
  const classes = useStyles()
  const modelState = useSelector(modelStateSelector)
  const predicateState = useSelector(predicteStateSelector)
  const advImage = useSelector(advSelector)
  const origImage = useSelector(imageSelector)
  const [attack, setAttack] = React.useState('FGSM')
  const dispatch = useDispatch()
  const inputLabel = React.useRef<HTMLLabelElement>(null)
  const [labelWidth, setLabelWidth] = React.useState(0)
  const [width, setWidth] = React.useState(window.innerWidth * 0.8)
  const [height, setHeight] = React.useState(window.innerHeight / 2)
  const [dispatched, setDispatched] = React.useState(false)
  const [originCanvasToBeRemaked, setOriginCanvasToBeRemaked] = React.useState(
    false,
  )
  const [
    perturbationCanvasToBeRemaked,
    setPerturbationCanvasToBeRemaked,
  ] = React.useState(false)
  const [advCanvasToBeRemaked, setAdvCanvasToBeRemaked] = React.useState(false)

  useWindowResize(() => {
    setWidth(window.innerWidth * 0.8)
    setHeight(window.innerHeight / 2)
  })
  React.useEffect(() => {
    setLabelWidth((inputLabel.current as HTMLLabelElement).offsetWidth)
  }, [])
  const originCanvas = useOffscreenCanvas(
    28,
    28,
    originCanvasToBeRemaked,
    setOriginCanvasToBeRemaked,
  )
  const perturbationCanvas = useOffscreenCanvas(
    28,
    28,
    perturbationCanvasToBeRemaked,
    setPerturbationCanvasToBeRemaked,
  )
  const advCanvas = useOffscreenCanvas(
    28,
    28,
    advCanvasToBeRemaked,
    setAdvCanvasToBeRemaked,
  )
  React.useEffect(() => {
    if (
      dispatched &&
      !originCanvasToBeRemaked &&
      !perturbationCanvasToBeRemaked &&
      !advCanvasToBeRemaked
    ) {
      setDispatched(false)
      dispatch(
        predictImage(
          attack,
          originCanvas?.transferControlToOffscreen() as OffscreenCanvas,
          perturbationCanvas?.transferControlToOffscreen() as OffscreenCanvas,
          advCanvas?.transferControlToOffscreen() as OffscreenCanvas,
        ),
      )
    }
  }, [
    dispatched,
    originCanvasToBeRemaked,
    perturbationCanvasToBeRemaked,
    advCanvasToBeRemaked,
  ])

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
          <MenuItem value="NewtonFool">NewtonFool</MenuItem>
        </Select>
      </FormControl>
      <Button
        loading={predicateState === StateStage.working}
        disabled={modelState !== StateStage.end}
        onClick={() => {
          setAdvCanvasToBeRemaked(true)
          setOriginCanvasToBeRemaked(true)
          setPerturbationCanvasToBeRemaked(true)
          setDispatched(true)
        }}
        success={predicateState === StateStage.end}
        message="Generate Adversarial Examples"
        successMessage="Generated. Try again?"
      />
      {predicateState === StateStage.end && (
        <AdvImage
          image={originCanvas as HTMLCanvasElement}
          perturbation={perturbationCanvas as HTMLCanvasElement}
          advImage={advCanvas as HTMLCanvasElement}
          label={origImage.label}
          advLabel={advImage.label}
          advAttack={advImage.attack}
          width={width}
          height={height}
        />
      )}
      {predicateState === StateStage.working && (
        <Loading width={width} height={height} />
      )}
    </>
  )
}

export default GenButton
