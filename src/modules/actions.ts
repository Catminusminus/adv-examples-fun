import { Dispatch } from 'redux'

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

export const trainModel = (data: any, dispatch: Dispatch<any>) => ({
  type: 'TRAIN_MODEL',
  payload: {
    data,
    dispatch,
  },
} as const)
