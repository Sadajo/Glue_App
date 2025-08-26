import React from 'react';
import Svg, {Circle} from 'react-native-svg';

type DotsVerticalIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

const DotsVerticalIcon = ({
  width = 16,
  height = 16,
  color = '#666666',
}: DotsVerticalIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="3" r="1.5" fill={color} />
      <Circle cx="8" cy="8" r="1.5" fill={color} />
      <Circle cx="8" cy="13" r="1.5" fill={color} />
    </Svg>
  );
};

export default DotsVerticalIcon;
