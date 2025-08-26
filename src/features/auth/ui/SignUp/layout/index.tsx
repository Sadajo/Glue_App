import React, {ReactNode, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Animated,
} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import {colors} from '@app/styles/colors';
import {Button} from '@shared/ui/Button';
import BackArrow from '@shared/assets/images/backArrow.svg';
import {useTranslation} from 'react-i18next';

// 네비게이션 타입 정의
type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
};

type SignUpLayoutProps = {
  navigation?: NavigationProp<RootStackParamList>;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextButtonLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
};

const SignUpLayout = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextButtonLabel,
  isNextDisabled = false,
  isLoading = false,
}: SignUpLayoutProps) => {
  const {t} = useTranslation();
  const buttonLabel = isLoading
    ? t('common.sending')
    : nextButtonLabel || t('common.next');

  // 애니메이션 값 생성
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // 현재 단계에 따른 애니메이션 업데이트
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: currentStep,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnimation]);

  // 각 세그먼트의 진행도 계산
  const getSegmentProgress = (segmentIndex: number) => {
    // 각 세그먼트가 담당하는 스텝 수 계산
    const stepsPerSegment = totalSteps / 3;

    // 현재 스텝이 해당 세그먼트에 해당하는지 계산
    const segmentStartStep = segmentIndex * stepsPerSegment;
    const segmentEndStep = (segmentIndex + 1) * stepsPerSegment;

    // 애니메이션 값에서 현재 진행도 계산
    return progressAnimation.interpolate({
      inputRange: [segmentStartStep, segmentEndStep],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
          {/* 상단 바 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <BackArrow width={21} height={18} />
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
          </View>

          {/* 진행 상태 바 (3등분) */}
          <View style={styles.progressContainer}>
            {[0, 1, 2].map(segment => (
              <View key={segment} style={styles.progressSegment}>
                <Animated.View
                  style={[
                    styles.progressBarSegment,
                    {width: getSegmentProgress(segment)},
                  ]}
                />
              </View>
            ))}
          </View>

          {/* 컨텐츠 영역 */}
          <View style={styles.contentContainer}>{children}</View>
        </ScrollView>

        {/* 다음 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            label={buttonLabel}
            onPress={onNext}
            variant={isNextDisabled ? 'disabled' : 'primary'}
            disabled={isNextDisabled || isLoading}
            loading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  headerSpacer: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  progressSegment: {
    height: 4,
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    marginHorizontal: 3,
    overflow: 'hidden',
  },
  progressBarSegment: {
    height: '100%',
    backgroundColor: colors.batteryChargedBlue,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignUpLayout;
