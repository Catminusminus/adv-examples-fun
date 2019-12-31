import * as React from 'react'
import Chart from '../components/Chart'
import { useSelector } from 'react-redux'
import { State } from '../modules'
const lossSelector = (state: State) => state.loss

const LossChart = () => {
  const loss = useSelector(lossSelector)

  const data = loss.map((v, i) => ({
    miniEpoch: i,
    loss: v,
  }))

  return (
    <Chart
      data={data}
      valueField="loss"
      argumentField="miniEpoch"
      color="blue"
      title="LOSS"
    />
  )
}

export default LossChart
