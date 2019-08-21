import * as React from 'react'
import Paper from '@material-ui/core/Paper'
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  Title,
} from '@devexpress/dx-react-chart-material-ui'

interface Props {
  data: any[]
  valueField: string
  argumentField: string
  color: string
  title: string
}

const ChartComponent: React.FC<Props> = ({
  data,
  valueField,
  argumentField,
  color,
  title,
}) => (
  <Paper>
    <Chart data={data} width={500}>
      <ArgumentAxis />
      <ValueAxis />
      <LineSeries
        valueField={valueField}
        argumentField={argumentField}
        color={color}
      />
      <Title text={title} />
    </Chart>
  </Paper>
)

export default ChartComponent
