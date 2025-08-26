import React from 'react';
import {StyleSheet} from 'react-native';
import Toast, {BaseToast, ToastConfig} from 'react-native-toast-message';

/**
 * 토스트 설정을 생성하는 함수
 */
export const createToastConfig = (theme: any): ToastConfig => {
  return {
    success: props => (
      <BaseToast
        {...props}
        style={[
          styles.baseToast,
          {
            backgroundColor: theme.colors.background,
            borderLeftColor: theme.colors.background,
            borderLeftWidth: 4,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.text1Style, {color: theme.colors.text}]}
        text2Style={[styles.text2Style, {color: theme.colors.textSecondary}]}
      />
    ),
    error: props => (
      <BaseToast
        {...props}
        style={[
          styles.baseToast,
          {
            backgroundColor: theme.colors.background,
            borderLeftColor: theme.colors.background,
            borderLeftWidth: 4,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.text1Style, {color: theme.colors.text}]}
        text2Style={[styles.text2Style, {color: theme.colors.textSecondary}]}
      />
    ),
    info: props => (
      <BaseToast
        {...props}
        style={[
          styles.baseToast,
          {
            backgroundColor: theme.colors.background,
            borderLeftColor: theme.colors.background,
            borderLeftWidth: 4,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.text1Style, {color: theme.colors.text}]}
        text2Style={[styles.text2Style, {color: theme.colors.textSecondary}]}
      />
    ),
    warning: props => (
      <BaseToast
        {...props}
        style={[
          styles.baseToast,
          {
            backgroundColor: theme.colors.background,
            borderLeftColor: theme.colors.background,
            borderLeftWidth: 4,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.text1Style, {color: theme.colors.text}]}
        text2Style={[styles.text2Style, {color: theme.colors.textSecondary}]}
      />
    ),
  };
};

/**
 * 앱 전체에서 사용하는 토스트 컴포넌트
 */
export const AppToast: React.FC<{theme: any}> = ({theme}) => {
  const toastConfig = createToastConfig(theme);
  return <Toast config={toastConfig} position="top" topOffset={60} />;
};

const styles = StyleSheet.create({
  baseToast: {
    height: 'auto',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 6,
    marginHorizontal: 16,
    minHeight: 5,
    borderRadius: 16,
  },
  contentContainer: {
    paddingHorizontal: 8,
  },
  text1Style: {
    fontSize: 16,
    fontWeight: '300',
  },
  text2Style: {
    fontSize: 14,
    marginTop: 2,
  },
});
