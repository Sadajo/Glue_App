import {useRef, useEffect} from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  PanResponderInstance,
} from 'react-native';

const {width} = Dimensions.get('window');

export const useAnimations = (
  showRoomInfo: boolean,
  isClosing: boolean,
  onClose: () => void,
) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 패널을 드래그하여 닫을 수 있는 PanResponder 설정
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dx > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          slideAnim.setValue(width * 0.25 + gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > width * 0.2) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: width * 0.25,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // 사이드 패널 애니메이션
  useEffect(() => {
    if (showRoomInfo && !isClosing) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: width * 0.25,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isClosing) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: width,
          useNativeDriver: true,
        }),
      ]).start(() => {
        slideAnim.setValue(width);
      });
    }
  }, [showRoomInfo, isClosing, fadeAnim, slideAnim]);

  return {
    slideAnim,
    fadeAnim,
    panResponder,
  };
};
