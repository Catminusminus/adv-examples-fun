import { createStore, applyMiddleware } from 'redux'
import { expose, createProxyStore } from 'react-redux-worker'
import createSagaMiddleware from 'redux-saga'
import rootSaga from '../sagas'
import { reducer } from '../modules'

const sagaMiddleware = createSagaMiddleware()
const store = createStore(reducer, applyMiddleware(sagaMiddleware))
sagaMiddleware.run(rootSaga)
const proxyStore = createProxyStore(store)
expose(proxyStore, self)
