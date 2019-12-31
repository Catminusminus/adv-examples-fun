import * as React from 'react'
import { Stage, Layer, Image, Text, Line } from 'react-konva'

interface Props {
  perturbation: any
  image: any
  advImage: any
  label: any
  advLabel: any
}

const AdvImageComponent: React.FC<Props> = ({
  perturbation,
  image,
  advImage,
  label,
  advLabel,
}) => (
  <Stage width={window.innerWidth} height={window.innerHeight}>
    <Layer>
      <Text
        text={`prediction: ${label}`}
        fontSize={16}
        x={window.innerWidth / 2 - 84 - 100 - 42}
        y={0}
      />
      <Image image={image} x={window.innerWidth / 2 - 42 - 84 - 100} y={20} />
      <Line
        x={window.innerWidth / 2 - 42 - 84 - 4}
        y={20 + 42}
        points={[0, 0, 25, 0, 25, 25, 25, 0, 50, 0, 25, 0, 25, -25]}
        stroke="black"
      />
      <Text
        text={`0.3 * `}
        fontSize={16}
        x={window.innerWidth / 2 - 42 - 36}
        y={20 + 42 - 8}
      />
      <Text
        text={`perturbation`}
        fontSize={16}
        x={window.innerWidth / 2 - 42}
        y={0}
      />
      <Image image={perturbation} x={window.innerWidth / 2 - 42} y={20} />
      <Line
        x={window.innerWidth / 2 - 42 + 84 + 42}
        y={20 + 42 - 10}
        points={[0, 0, 25, 0]}
        stroke="black"
      />
      <Line
        x={window.innerWidth / 2 - 42 + 84 + 42}
        y={20 + 42 + 10}
        points={[0, 0, 25, 0]}
        stroke="black"
      />
      <Text
        text={`prediction: ${advLabel}`}
        fontSize={16}
        x={window.innerWidth / 2 + 84 - 42 + 100}
        y={0}
      />
      <Image
        image={advImage}
        x={window.innerWidth / 2 - 42 + 84 + 100}
        y={20}
      />
    </Layer>
  </Stage>
)

export default AdvImageComponent
