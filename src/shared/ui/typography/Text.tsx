import React from 'react';
import {Text as RNText, StyleSheet} from 'react-native';
import {useTheme} from '../../../app/providers/theme';
import {TextProps} from './types';

// 폰트 굵기 매핑 함수 (CSS font-weight 값 사용)
const getFontWeight = (weight: string): string | number => {
  const weightMap: Record<string, string | number> = {
    thin: '100',
    extraLight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  };

  return weightMap[weight] || '400';
};

export const Text = ({
  variant = 'body1',
  color,
  align = 'auto',
  weight,
  style,
  children,
  ...props
}: TextProps) => {
  const {theme} = useTheme();
  const typography = theme?.typography || {};
  const colors = theme?.colors || {};

  // 기본 스타일 가져오기
  const baseStyle = typography[variant] || typography['body1'] || {};

  // 가중치 재정의 (제공된 경우)
  // weight 속성이 제공되면 해당 가중치 사용, 아니면 기본 variant 스타일의 fontWeight 사용
  const fontWeight = weight
    ? getFontWeight(weight)
    : baseStyle.fontWeight || '400';

  const textStyle = StyleSheet.compose(
    {
      ...baseStyle,
      color: color || colors.text || '#000000',
      textAlign: align,
      fontFamily: 'Pretendard-Regular', // 기본 폰트 패밀리 사용
      fontWeight,
    },
    style,
  );

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};
