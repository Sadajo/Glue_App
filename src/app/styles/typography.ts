import {TextStyle} from 'react-native';

// 폰트 굵기 타입 정의 (Pretendard 폰트의 모든 굵기 추가)
type FontWeight =
  | 'thin'
  | 'extraLight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'black';

// Pretendard 폰트 Family 맵핑
const fontFamily = {
  thin: 'Pretendard-Thin',
  extraLight: 'Pretendard-ExtraLight',
  light: 'Pretendard-Light',
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extraBold: 'Pretendard-ExtraBold',
  black: 'Pretendard-Black',
};

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 40,
};

// 텍스트 스타일 생성 함수
export const createTextStyle = (
  size: keyof typeof fontSize,
  weight: FontWeight = 'regular',
): TextStyle => ({
  fontFamily: fontFamily[weight],
  fontSize: fontSize[size],
  lineHeight: lineHeight[size],
});

// Typography 스타일 정의
export const typography = {
  h1: createTextStyle('xxxl', 'bold'),
  h2: createTextStyle('xxl', 'semiBold'),
  h3: createTextStyle('xl', 'bold'),
  h4: createTextStyle('lg', 'semiBold'),
  subtitle1: createTextStyle('lg', 'medium'),
  subtitle2: createTextStyle('md', 'medium'),
  body1: createTextStyle('md', 'regular'),
  body2: createTextStyle('sm', 'regular'),
  button: createTextStyle('md', 'semiBold'),
  caption: createTextStyle('xs', 'regular'),
};
