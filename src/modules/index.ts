import { Reducer, AnyAction } from 'redux'
import * as actions from './actions'

export interface State {
  epochs: number
  currentEpoch: number
  loss: number[]
  acc: number[]
  index: number | null
  data: any
  model: any
  dataLoding: boolean
  modelTraining: boolean
  dataLoaded: boolean
  modelTrained: boolean
}

const initialState: State = {
  epochs: 3,
  currentEpoch: 0,
  loss: [],
  acc: [],
  index: null,
  data: null,
  model: null,
  dataLoding: false,
  modelTraining: false,
  dataLoaded: false,
  modelTrained: false,
}

export const setEpochs = (epochs: number) => ({
  type: 'SET_EPOCHS',
  payload: epochs,
} as const)

export const setLoss = (loss: number) => ({
  type: 'SET_LOSS',
  payload: loss
} as const)

export const incrementEpoch = () => ({
  type: 'INCREMENT_EPOCH',
} as const)

export const setAcc = (acc: number) => ({
  type: 'SET_ACC',
  payload: acc,
} as const)

export const setIndex = (index: number) => ({
  type: 'SET_INDEX',
  payload: index,
} as const)

export const setData = (data: any) => ({
  type: 'SET_DATA',
  payload: data,
} as const)

export const setModel = (model: any) => ({
  type: 'SET_MODEL',
  payload: model,
} as const)

export const setDataLoading = (dataLoading: boolean) => ({
  type: 'SET_DATA_LOADING',
  payload: dataLoading,
} as const)

export const setModelTraining = (modelTraining: boolean) => ({
  type: 'SET_MODEL_TRAINING',
  payload: modelTraining,
} as const)

export const setDataLoaded = (dataLoaded: boolean) => ({
  type: 'SET_DATA_LOADED',
  payload: dataLoaded,
} as const)

export const setModelTrained = (modelTrained: boolean) => ({
  type: 'SET_MODEL_TRAINED',
  payload: modelTrained,
} as const)

export const trainModel = (data: any) => ({
  type: 'TRAIN_MODEL',
  payload: data,
} as const)

export type ActionsType<ActionCreators extends object> = {
  [Key in keyof ActionCreators]: ActionCreators[Key] extends (
    ...args: any[]
  ) => AnyAction
    ? ReturnType<ActionCreators[Key]>
    : never
}

export type ActionType<
  ActionCreators extends object,
  Actions = ActionsType<ActionCreators>
> = { [Key in keyof Actions]: Actions[Key] }[keyof Actions]

type AppAction =ActionType<typeof actions>

export const reducer: Reducer<State, AppAction> = (
  state: State = initialState,
  action: AppAction,
) => {
  switch (action.type) {
    case 'SET_EPOCHS':
      return {
        ...state,
        epochs: action.payload,
      }
    case 'INCREMENT_EPOCH':
      return {
        ...state,
        currentEpoch: state.currentEpoch + 1,
      }
    case 'SET_LOSS':
      return {
        ...state,
        loss: state.loss.concat([action.payload || -1]),
      }
    case 'SET_ACC':
      return {
        ...state,
        acc: state.acc.concat([action.payload || 0]),
      }
    case 'SET_INDEX':
      return {
        ...state,
        index: action.payload,
      }
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload,
      }
    case 'SET_MODEL':
      return {
        ...state,
        model: action.payload,
      }
    case 'SET_DATA_LOADED':
      return {
        ...state,
        dataLoaded: action.payload,
      }
    case 'SET_MODEL_TRAINED':
      return {
        ...state,
        modelTrained: action.payload,
      }
    case 'SET_DATA_LOADING':
      return {
        ...state,
        dataLoding: action.payload,
      }
    case 'SET_MODEL_TRAINING':
      return {
        ...state,
        modelTraining: action.payload,
      }
    default: {
      return state
    }
  }
}
