import { Dispatch } from 'redux'
import { StateStage } from './index'
import { MnistData } from '../utils/data'
import * as tf from '@tensorflow/tfjs'

export const setEpochs = (epochs: number) =>
  ({
    type: 'SET_EPOCHS',
    payload: epochs,
  } as const)

export const setLoss = (loss: number) =>
  ({
    type: 'SET_LOSS',
    payload: loss,
  } as const)

export const incrementEpoch = () =>
  ({
    type: 'INCREMENT_EPOCH',
  } as const)

export const setAcc = (acc: number) =>
  ({
    type: 'SET_ACC',
    payload: acc,
  } as const)

export const setIndex = (index: number) =>
  ({
    type: 'SET_INDEX',
    payload: index,
  } as const)

export const setData = (data: MnistData) =>
  ({
    type: 'SET_DATA',
    payload: data,
  } as const)

export const setModel = (model: tf.Sequential) =>
  ({
    type: 'SET_MODEL',
    payload: model,
  } as const)

export const setDataState = (dataState: StateStage) =>
  ({
    type: 'SET_DATA_STATE',
    payload: dataState,
  } as const)

export const setModelState = (modelState: StateStage) =>
  ({
    type: 'SET_MODEL_STATE',
    payload: modelState,
  } as const)

export const trainModel = (data: MnistData, dispatch: Dispatch<any>) =>
  ({
    type: 'TRAIN_MODEL',
    payload: {
      data,
      dispatch,
    },
  } as const)

export const setImage = (image: any, label: any, index: number) =>
  ({
    type: 'SET_IMAGE',
    payload: {
      image,
      label,
      index,
    },
  } as const)

export const setPredicateState = (predicateState: StateStage) =>
  ({
    type: 'SET_PREDICATE_STATE',
    payload: predicateState,
  } as const)

export const predictImage = (
  data: MnistData,
  dispatch: Dispatch<any>,
  model: tf.Sequential,
  attack: string,
) =>
  ({
    type: 'PREDICT',
    payload: {
      data,
      dispatch,
      model,
      attack,
    },
  } as const)

export const setPerturbation = (perturbation: any) =>
  ({
    type: 'SET_PERTURBATION',
    payload: perturbation,
  } as const)

export const setAdvImage = (image: any, label: any, attack: string) =>
  ({
    type: 'SET_ADVIMAGE',
    payload: {
      image,
      label,
      attack,
    },
  } as const)
