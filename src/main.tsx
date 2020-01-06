import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Grid from '@material-ui/core/Grid'
import AccLossChart from './containers/AccLossChart'
import LoadButton from './containers/LoadButton'
import TrainButton from './containers/TrainButton'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { reducer } from './modules'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'
// import { composeWithDevTools } from 'redux-devtools-extension'
import GenButton from './containers/GenButton'
import Header from './components/Header'
import { makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) => ({
  grid: {
    margin: theme.spacing(0),
    flexGrow: 0,
    maxWidth: `100%`,
    flexBasis: `100%`,
  },
}))

const sagaMiddleware = createSagaMiddleware()
// If you use the next line, your browser will crash
// const store = createStore(reducer, composeWithDevTools(applyMiddleware(sagaMiddleware)))
const store = createStore(reducer, applyMiddleware(sagaMiddleware))
sagaMiddleware.run(rootSaga)
const App = () => {
  const classes = useStyles()

  return (
    <Provider store={store}>
      <Grid container spacing={3} justify="center" className={classes.grid}>
        <Header />
        <Grid container item xs={12} justify="center">
          <LoadButton />
        </Grid>
        <Grid container item xs={12} justify="center">
          <TrainButton />
        </Grid>
        <Grid container item xs={12} justify="center">
          <AccLossChart />
        </Grid>
        <Grid container item xs={12} justify="center">
          <GenButton />
        </Grid>
      </Grid>
    </Provider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
