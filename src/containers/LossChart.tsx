import * as React from 'react'
import Chart from '../components/chart'

const LossChart = () => {
  const data = [
    {
      miniEpoch: 0,
      loss: 0,
    },
  ]

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
