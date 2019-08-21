import * as React from 'react'
import Chart from '../components/chart'

const AccChart = () => {
  const data = [
    {
      miniEpoch: 0,
      acc: 0,
    },
  ]

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
