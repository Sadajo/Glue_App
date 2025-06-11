import React, {ReactNode} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {QueryProvider} from './query';
import {ThemeProvider, useTheme} from './theme';
import {WebSocketProvider} from './websocket';
import {NavigationContainer} from '@react-navigation/native';
import {I18nextProvider} from 'react-i18next';
import i18n from '../../shared/lib/i18n';
import {navigationRef} from '../navigation/RootNavigation';

// 앱 프로바이더 타입
interface AppProviderProps {
  children: ReactNode;
}

// 항상 라이트 모드 테마의 상태바 설정 컴포넌트
const ThemedStatusBar = () => {
  const {theme} = useTheme();
  return (
    <StatusBar
      barStyle="dark-content"
      backgroundColor={theme.colors.background}
    />
  );
};

// SafeArea 및 네비게이션 컨테이너
const ThemedSafeAreaContainer = ({children}: {children: ReactNode}) => {
  const {theme} = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      edges={['top']}>
      <ThemedStatusBar />
      <NavigationContainer
        ref={navigationRef}
        onStateChange={state => {
          // 네비게이션 상태 변경 디버깅 로그
          console.log('Navigation State:', state);
        }}>
        {children}
      </NavigationContainer>
    </SafeAreaView>
  );
};

/**
 * 앱 전체 프로바이더 컴포넌트
 * 모든 글로벌 프로바이더를 통합하여 제공합니다.
 */
export const AppProvider = ({children}: AppProviderProps) => {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          <WebSocketProvider>
            <I18nextProvider i18n={i18n}>
              <ThemedSafeAreaContainer>{children}</ThemedSafeAreaContainer>
            </I18nextProvider>
          </WebSocketProvider>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
};
