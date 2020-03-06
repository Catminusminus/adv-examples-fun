import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Grid from '@material-ui/core/Grid'
import AccLossChart from './containers/AccLossChart'
import LoadButton from './containers/LoadButton'
import TrainButton from './containers/TrainButton'
import GenButton from './containers/GenButton'
import Header from './components/Header'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { getProvider } from 'react-redux-worker'

const useStyles = makeStyles((theme: Theme) => ({
  grid: {
    margin: theme.spacing(0),
    flexGrow: 0,
    maxWidth: `100%`,
    flexBasis: `100%`,
  },
}))

const worker = new Worker('./worker/worker.ts')
const ProxyProvider = getProvider(worker)

const App = () => {
  const classes = useStyles()

  return (
    <ProxyProvider>
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
    </ProxyProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
