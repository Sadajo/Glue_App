import React, {ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import {useTheme} from '../../../app/providers/theme';

interface SafeAreaProps {
  children: ReactNode;
  style?: any;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  backgroundColor?: string;
}

export const SafeArea = ({
  children,
  style,
  edges,
  backgroundColor,
}: SafeAreaProps) => {
  const {theme} = useTheme();
  // const bgColor = backgroundColor || theme?.colors?.background || '#FFFFFF';
  const bgColor = '#FFFFFF';

  return (
    <SafeAreaView
      edges={edges || ['top', 'right', 'bottom', 'left']}
      style={[styles.container, {backgroundColor: bgColor}, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Provider 내보내기
export {SafeAreaProvider};
