import * as React from 'react'
import Chart from '../components/Chart'
import { useSelector } from 'react-redux-worker'
import { State } from '../modules'
const accSelector = (state: State) => state.acc
const lossSelector = (state: State) => state.loss

const AccLossChart = () => {
  const acc = useSelector(accSelector)
  const loss = useSelector(lossSelector)

  const data = acc.map((v: number, i: number) => ({
    miniEpoch: i,
    acc: v,
    loss: loss[i],
  }))

  return <Chart data={data} dataKey="miniEpoch" />
}

export default AccLossChart
