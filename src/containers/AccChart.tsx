import * as React from 'react'
import Chart from '../components/Chart'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../modules'
const accSelector = (state: State) => state.acc

const AccChart = () => {
  const acc = useSelector(accSelector)

  const data = acc.map((v, i) => ({
    miniEpoch: i,
    acc: v,
  }))

  return (
    <Chart
      data={data}
      valueField="acc"
      argumentField="miniEpoch"
      color="red"
      title="ACC"
    />
  )
}

export default AccChart
