import { Reducer } from 'redux'
import { number } from 'prop-types'

enum ActionType {
  SET_EPOCHS = 'SET_EPOCHS',
  INCREMENT_EPOCH = 'INCREMENT_EPOCH',
  SET_LOSS = 'SET_LOSS',
  SET_ACC = 'SET_ACC',
  SET_INDEX = 'SET_INDEX',
  SET_DATA = 'SET_DATA'
}

interface State {
  epochs: number
  currentEpoch: number
  loss: number[]
  acc: number[]
  index: number | null
  data: any
}

interface AppAction {
  type: ActionType
  payload: {
    epochs?: number
    loss?: number
    acc?: number
    index?: number
    data?: any
  }
}

const initialState: State = {
  epochs: 3,
  currentEpoch: 0,
  loss: [],
  acc: [],
  index: null,
  data: null
}

const setPoints = (epochs: number) => ({
  type: ActionType.SET_EPOCHS,
  payload: {
    epochs: epochs,
  },
})

const setLoss = (loss: number) => ({
  type: ActionType.SET_LOSS,
  payload: {
    loss: loss,
  },
})

const incrementEpoch = () => ({
  type: ActionType.INCREMENT_EPOCH,
})

const setAcc = (acc: number) => ({
  type: ActionType.SET_ACC,
  payload: {
    acc: acc,
  },
})

const setIndex = (index: number) => ({
  type: ActionType.SET_INDEX,
  payload: {
    index: index,
  },
})

export const setData = (data: any) => ({
  type: ActionType.SET_DATA,
  payload: {
    data: data,
  }
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
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _: never = action.type

      return state
    }
  }
}
