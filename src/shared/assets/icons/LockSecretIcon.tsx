import React from 'react';
import Svg, {Path, Rect, Circle} from 'react-native-svg';

type LockSecretIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

const LockSecretIcon = ({
  width = 16,
  height = 16,
  color = '#666666',
}: LockSecretIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Rect
        x="4"
        y="7"
        width="8"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <Path
        d="M6 7V5C6 3.89543 6.89543 3 8 3C9.10457 3 10 3.89543 10 5V7"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="8" cy="10" r="1" fill={color} />
    </Svg>
  );
};

export default LockSecretIcon;
