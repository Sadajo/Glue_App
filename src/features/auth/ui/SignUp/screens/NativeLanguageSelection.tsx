import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '@app/styles/colors';
import {useTranslation} from 'react-i18next';
import SelectionButton from '@shared/ui/SelectionButton';
import {Text} from '@shared/ui/typography/Text';

type NativeLanguageSelectionProps = {
  selectedLanguage: string | null;
  onLanguageSelect: (language: string) => void;
};

const NativeLanguageSelection = ({
  selectedLanguage,
  onLanguageSelect,
}: NativeLanguageSelectionProps) => {
  const {t} = useTranslation();

  // 언어 옵션 정의
  const languageOptions = [
    {id: 'korean', name: t('signup.nativeLanguage.korean')},
    {id: 'english', name: t('signup.nativeLanguage.english')},
    {id: 'japanese', name: t('signup.nativeLanguage.japanese')},
    {id: 'chinese', name: t('signup.nativeLanguage.chinese')},
    {id: 'german', name: t('signup.nativeLanguage.german')},
    {id: 'french', name: t('signup.nativeLanguage.french')},
    {id: 'spanish', name: t('signup.nativeLanguage.spanish')},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="h2"
          weight="semiBold"
          color={colors.richBlack}
          style={styles.title}>
          {t('signup.nativeLanguage.title')}
        </Text>
        <Text variant="body2" color={colors.charcoal} style={styles.subtitle}>
          {t('signup.nativeLanguage.subtitle')}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {/* 첫 번째 행: 한국어, 영어 */}
        <View style={styles.row}>
          <View style={styles.leftItem}>
            <SelectionButton
              label={languageOptions[0].name}
              isSelected={selectedLanguage === languageOptions[0].id}
              onPress={() => onLanguageSelect(languageOptions[0].id)}
              compact={true}
            />
          </View>
          <View style={styles.rightItem}>
            <SelectionButton
              label={languageOptions[1].name}
              isSelected={selectedLanguage === languageOptions[1].id}
              onPress={() => onLanguageSelect(languageOptions[1].id)}
              compact={true}
            />
          </View>
        </View>

        {/* 두 번째 행: 일본어, 중국어 */}
        <View style={styles.row}>
          <View style={styles.leftItem}>
            <SelectionButton
              label={languageOptions[2].name}
              isSelected={selectedLanguage === languageOptions[2].id}
              onPress={() => onLanguageSelect(languageOptions[2].id)}
              compact={true}
            />
          </View>
          <View style={styles.rightItem}>
            <SelectionButton
              label={languageOptions[3].name}
              isSelected={selectedLanguage === languageOptions[3].id}
              onPress={() => onLanguageSelect(languageOptions[3].id)}
              compact={true}
            />
          </View>
        </View>

        {/* 세 번째 행: 독일어, 프랑스어 */}
        <View style={styles.row}>
          <View style={styles.leftItem}>
            <SelectionButton
              label={languageOptions[4].name}
              isSelected={selectedLanguage === languageOptions[4].id}
              onPress={() => onLanguageSelect(languageOptions[4].id)}
              compact={true}
            />
          </View>
          <View style={styles.rightItem}>
            <SelectionButton
              label={languageOptions[5].name}
              isSelected={selectedLanguage === languageOptions[5].id}
              onPress={() => onLanguageSelect(languageOptions[5].id)}
              compact={true}
            />
          </View>
        </View>

        {/* 네 번째 행: 스페인어 (한 개만) */}
        <View style={styles.row}>
          <View style={styles.leftItem}>
            <SelectionButton
              label={languageOptions[6].name}
              isSelected={selectedLanguage === languageOptions[6].id}
              onPress={() => onLanguageSelect(languageOptions[6].id)}
              compact={true}
            />
          </View>
          <View style={styles.rightItem}>{/* 빈 영역 */}</View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 64,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {},
  optionsContainer: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  leftItem: {
    flex: 1,
    marginRight: 9,
  },
  rightItem: {
    flex: 1,
  },
});

export default NativeLanguageSelection;
