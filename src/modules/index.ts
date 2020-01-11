import { Reducer, AnyAction } from 'redux'
import * as actions from './actions'
import { MnistData } from '../utils/data'
import * as tf from '@tensorflow/tfjs'

export enum StateStage {
  init,
  working,
  end,
}

export interface State {
  epochs: number
  currentEpoch: number
  loss: number[]
  acc: number[]
  index?: number
  data?: MnistData
  model?: tf.Sequential
  dataState: StateStage
  modelState: StateStage
  accImage?: {
    image: any
    label: any
    index: number
  }
  predicateState: StateStage
  perturbation?: HTMLCanvasElement
  advImage?: {
    image: any
    label: any
    attack: string
  }
}

const initialState: State = {
  epochs: 3,
  currentEpoch: 0,
  loss: [],
  acc: [],
  dataState: StateStage.init,
  modelState: StateStage.init,
  predicateState: StateStage.init,
}

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

type AppAction = ActionType<typeof actions>

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
    case 'SET_DATA_STATE':
      return {
        ...state,
        dataState: action.payload,
      }
    case 'SET_MODEL_STATE':
      return {
        ...state,
        modelState: action.payload,
      }
    case 'SET_IMAGE':
      return {
        ...state,
        accImage: action.payload,
      }
    case 'SET_PREDICATE_STATE':
      return {
        ...state,
        predicateState: action.payload,
      }
    case 'SET_PERTURBATION':
      return {
        ...state,
        perturbation: action.payload,
      }
    case 'SET_ADVIMAGE':
      return {
        ...state,
        advImage: action.payload,
      }
    default: {
      return state
    }
  }
}
