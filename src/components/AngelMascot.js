import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const AngelMascot = ({ size = 80, style }) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Halo */}
        <Circle cx="50" cy="18" r="12" fill="none" stroke="#FFD54F" strokeWidth="3" />
        {/* Head */}
        <Circle cx="50" cy="35" r="15" fill="#FFF8E1" stroke="#FFE082" strokeWidth="2" />
        {/* Eyes */}
        <Circle cx="44" cy="32" r="3" fill="#5D4037" />
        <Circle cx="56" cy="32" r="3" fill="#5D4037" />
        {/* Smile */}
        <Path
          d="M 42 42 Q 50 48 58 42"
          fill="none"
          stroke="#5D4037"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Body */}
        <Path
          d="M 35 52 Q 50 75 65 52 L 60 90 Q 50 85 40 90 Z"
          fill="#FFF8E1"
          stroke="#FFE082"
          strokeWidth="2"
        />
        {/* Left wing */}
        <Path
          d="M 35 52 Q 5 45 15 70 Q 25 60 35 52"
          fill="#FFECB3"
          stroke="#FFE082"
          strokeWidth="2"
        />
        {/* Right wing */}
        <Path
          d="M 65 52 Q 95 45 85 70 Q 75 60 65 52"
          fill="#FFECB3"
          stroke="#FFE082"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

export default AngelMascot;
