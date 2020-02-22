import * as React from 'react'
import { Stage, Layer, Text } from 'react-konva'

interface Props {
  width: number
  height: number
}

const Loading: React.FC<Props> = ({ width, height }) => (
  <Stage width={width} height={height}>
    <Layer>
      <Text
        text={`Loading...`}
        fontSize={16}
        x={window.innerWidth / 2 + 84 - 42}
        y={0}
      />
    </Layer>
  </Stage>
)

export default Loading
