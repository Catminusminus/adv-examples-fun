import { Reducer } from 'redux'
import { actionChannel } from 'redux-saga/effects'

export enum ActionType {
  SET_EPOCHS = 'SET_EPOCHS',
  INCREMENT_EPOCH = 'INCREMENT_EPOCH',
  SET_LOSS = 'SET_LOSS',
  SET_ACC = 'SET_ACC',
  SET_INDEX = 'SET_INDEX',
  SET_DATA = 'SET_DATA',
  SET_MODEL = 'SET_MODEL',
  SET_DATA_LOADING = 'SET_LOADING',
  SET_MODEL_TRAINING = 'SET_MODEL_TRAINING',
  SET_DATA_LOADED = 'SET_DATA_LOADED',
  SET_MODEL_TRAINED = 'SET_MODEL_TRAINED',
  LOAD_DATA = 'LOAD_DATA',
  TRAIN_MODEL = 'TRAIN_MODEL',
}

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

interface AppAction {
  type: ActionType
  payload: {
    epochs?: number
    loss?: number
    acc?: number
    index?: number
    data?: any
    model?: any
    dataLoding?: boolean
    modelTraining?: boolean
    dataLoaded?: boolean
    modelTrained?: boolean
  }
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

export const setPoints = (epochs: number) => ({
  type: ActionType.SET_EPOCHS,
  payload: {
    epochs,
  },
})

export const setLoss = (loss: number) => ({
  type: ActionType.SET_LOSS,
  payload: {
    loss,
  },
})

export const incrementEpoch = () => ({
  type: ActionType.INCREMENT_EPOCH,
})

export const setAcc = (acc: number) => ({
  type: ActionType.SET_ACC,
  payload: {
    acc,
  },
})

export const setIndex = (index: number) => ({
  type: ActionType.SET_INDEX,
  payload: {
    index,
  },
})

export const setData = (data: any) => ({
  type: ActionType.SET_DATA,
  payload: {
    data,
  },
})

export const setModel = (model: any) => ({
  type: ActionType.SET_MODEL,
  payload: {
    model,
  },
})

export const setDataLoading = (dataLoading: boolean) => ({
  type: ActionType.SET_DATA_LOADING,
  payload: {
    dataLoading,
  },
})

export const setModelTraining = (modelTraining: boolean) => ({
  type: ActionType.SET_MODEL_TRAINING,
  payload: {
    modelTraining,
  },
})

export const setDataLoaded = (dataLoaded: boolean) => ({
  type: ActionType.SET_DATA_LOADED,
  payload: {
    dataLoaded,
  },
})

export const setModelTrained = (modelTrained: boolean) => ({
  type: ActionType.SET_MODEL_TRAINED,
  payload: {
    modelTrained,
  },
})

export const trainModel = (data: any) => ({
  type: ActionType.TRAIN_MODEL,
  payload: {
    data,
  },
})

export const reducer: Reducer<State, AppAction> = (
  state: State = initialState,
  action: AppAction,
) => {
  switch (action.type) {
    case ActionType.SET_EPOCHS:
      return {
        ...state,
        epochs: action.payload.epochs,
      }
    case ActionType.INCREMENT_EPOCH:
      return {
        ...state,
        currentEpoch: state.currentEpoch + 1,
      }
    case ActionType.SET_LOSS:
      return {
        ...state,
        loss: state.loss.concat([action.payload.loss || -1]),
      }
    case ActionType.SET_ACC:
      return {
        ...state,
        acc: state.acc.concat([action.payload.acc || 0]),
      }
    case ActionType.SET_INDEX:
      return {
        ...state,
        index: action.payload.index,
      }
    case ActionType.SET_DATA:
      return {
        ...state,
        data: action.payload.data,
      }
    case ActionType.SET_MODEL:
      return {
        ...state,
        model: action.payload.model,
      }
    case ActionType.SET_DATA_LOADED:
      return {
        ...state,
        dataLoaded: action.payload.dataLoaded,
      }
    case ActionType.SET_MODEL_TRAINED:
      return {
        ...state,
        modelTrained: action.payload.modelTrained,
      }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _: never = action.type

      return state
    }
  }
}
