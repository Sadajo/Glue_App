export const colors = {
  // 블루 계열
  batteryChargedBlue: '#1CBFDC',
  maximumBlueGreen: '#25CDBF',

  // 그린 계열
  eucalyptus: '#31E195',
  screaminGreen: '#45FF54',

  // 다크 계열
  richBlack: '#030712',
  darkCharcoal: '#303030',
  charcoal: '#384050',

  // 메탈/그레이 계열
  auroMetalSaurus: '#6C7180',
  manatee: '#9DA2AF',

  // 실버/화이트 계열
  lightSilver: '#D2D5DB',
  antiFlashWhite: '#F3F4F6',
  ghostWhite: '#F9FAFB',

  white: '#FFFFFF',
};

// 의미적 색상 (앱 전체에서 일관되게 사용)
export const semanticColors = {
  primary: colors.maximumBlueGreen,
  secondary: colors.eucalyptus,
  background: colors.white,
  surface: colors.antiFlashWhite,
  text: colors.richBlack,
  textSecondary: colors.charcoal,
  border: colors.lightSilver,
  error: '#FF3B30',
  success: colors.screaminGreen,
  warning: '#FFCC00',
};
