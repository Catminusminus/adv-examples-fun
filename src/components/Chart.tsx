import * as React from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { CardContent } from '@material-ui/core'

interface Props {
  data: any[]
  dataKey: string
}

const ChartComponent: React.FC<Props> = ({ data, dataKey }) => (
  <Card>
    <CardHeader title={`Acc & Loss`} />
    <CardContent>
      <LineChart
        width={600}
        height={400}
        data={data}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="acc" stroke="#8884d8" />
        <Line type="monotone" dataKey="loss" stroke="#82ca9d" />
      </LineChart>
    </CardContent>
  </Card>
)

export default ChartComponent
