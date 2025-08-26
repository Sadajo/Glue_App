import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {SafeArea} from '@shared/ui';
import {Text as TypographyText} from '@shared/ui/typography/Text';
import {useMyPage} from '../model/useMyPage';
import {useUpdateLearningLanguage} from '../api/hooks';
import {BackButtonHeader} from '@widgets/header/ui';

// 언어 옵션
const LANGUAGE_OPTIONS = [
  {label: '한국어', value: 1},
  {label: '영어', value: 2},
  {label: '일본어', value: 3},
  {label: '중국어', value: 4},
  {label: '독일어', value: 5},
  {label: '프랑스어', value: 6},
  {label: '스페인어', value: 7},
];

// 언어 수준 옵션
const LEVEL_OPTIONS = [
  {label: '초보', value: 0},
  {label: '초급', value: 1},
  {label: '중급', value: 2},
  {label: '중상급', value: 3},
  {label: '고급', value: 4},
  {label: '능숙', value: 5},
];

const ExchangeLanguageEditScreen = () => {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const {myPageInfo, isLoading} = useMyPage();
  const updateLearningLanguage = useUpdateLearningLanguage();

  // 드롭다운 상태
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  // 선택된 값들
  const [selectedLanguage, setSelectedLanguage] = useState<number>(2);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);

  // 기존 데이터로 초기화
  useEffect(() => {
    if (myPageInfo) {
      setSelectedLanguage(myPageInfo.learningLanguage);
      setSelectedLevel(myPageInfo.learningLanguageLevel);
    }
  }, [myPageInfo]);

  // 언어 수정
  const handleUpdateLanguage = async () => {
    try {
      console.log('교환 언어 수정 요청:', {
        language: selectedLanguage,
        languageLevel: selectedLevel,
      });

      await updateLearningLanguage.mutateAsync({
        language: selectedLanguage,
        languageLevel: selectedLevel,
      });

      console.log('교환 언어 수정 성공');
      Alert.alert('성공', '교환 언어가 수정되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.error('교환 언어 수정 에러:', error);
      Alert.alert(
        '오류',
        `언어 수정에 실패했습니다: ${error.message || '알 수 없는 오류'}`,
      );
    }
  };

  // 언어 이름 가져오기
  const getLanguageName = (languageId: number) => {
    const language = LANGUAGE_OPTIONS.find(
      option => option.value === languageId,
    );
    return language ? language.label : '언어 선택';
  };

  // 수준 이름 가져오기
  const getLevelName = (levelId: number) => {
    const level = LEVEL_OPTIONS.find(option => option.value === levelId);
    return level ? level.label : '수준 선택';
  };

  if (isLoading) {
    return (
      <SafeArea>
        <View style={styles.loadingContainer}>
          <TypographyText>로딩 중...</TypographyText>
        </View>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      <BackButtonHeader title="교환 언어" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* 언어 선택 */}
          <View style={styles.section}>
            <TypographyText style={styles.label}>교환 언어</TypographyText>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}>
              <TypographyText style={styles.dropdownValue}>
                {getLanguageName(selectedLanguage)}
              </TypographyText>
              <TypographyText
                style={[
                  styles.dropdownArrow,
                  showLanguageDropdown && styles.dropdownArrowUp,
                ]}>
                ▼
              </TypographyText>
            </TouchableOpacity>

            {/* 언어 드롭다운 옵션 */}
            {showLanguageDropdown && (
              <View style={styles.dropdownOptions}>
                {LANGUAGE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      selectedLanguage === option.value &&
                        styles.selectedOption,
                    ]}
                    onPress={() => {
                      setSelectedLanguage(option.value);
                      setShowLanguageDropdown(false);
                    }}>
                    <TypographyText
                      style={[
                        styles.dropdownOptionText,
                        selectedLanguage === option.value &&
                          styles.selectedOptionText,
                      ]}>
                      {option.label}
                    </TypographyText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 언어 수준 선택 */}
          <View style={styles.section}>
            <TypographyText style={styles.label}>언어 수준</TypographyText>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setShowLevelDropdown(!showLevelDropdown)}>
              <TypographyText style={styles.dropdownValue}>
                {getLevelName(selectedLevel)}
              </TypographyText>
              <TypographyText
                style={[
                  styles.dropdownArrow,
                  showLevelDropdown && styles.dropdownArrowUp,
                ]}>
                ▼
              </TypographyText>
            </TouchableOpacity>

            {/* 언어 수준 드롭다운 옵션 */}
            {showLevelDropdown && (
              <View style={styles.dropdownOptions}>
                {LEVEL_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      selectedLevel === option.value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setSelectedLevel(option.value);
                      setShowLevelDropdown(false);
                    }}>
                    <TypographyText
                      style={[
                        styles.dropdownOptionText,
                        selectedLevel === option.value &&
                          styles.selectedOptionText,
                      ]}>
                      {option.label}
                    </TypographyText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 하단 고정 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.modifyButton}
            onPress={handleUpdateLanguage}
            disabled={updateLearningLanguage.isPending}>
            <TypographyText style={styles.modifyButtonText}>
              {updateLearningLanguage.isPending ? '수정 중...' : '수정하기'}
            </TypographyText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 12,
    fontWeight: '500',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdownValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dropdownArrowUp: {
    transform: [{rotate: '180deg'}],
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  selectedOptionText: {
    color: '#1DBFDC',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modifyButton: {
    backgroundColor: '#1DBFDC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExchangeLanguageEditScreen;
