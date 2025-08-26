import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '@app/styles/colors';
import {useTranslation} from 'react-i18next';
import LevelButton from '@shared/ui/LevelButton';
import {Text} from '@shared/ui/typography/Text';

type ExchangeLanguageLevelSelectionProps = {
  selectedLevel: string | null;
  onLevelSelect: (level: string) => void;
  exchangeLanguage: string | null;
};

const ExchangeLanguageLevelSelection = ({
  selectedLevel,
  onLevelSelect,
  exchangeLanguage,
}: ExchangeLanguageLevelSelectionProps) => {
  const {t} = useTranslation();

  // 수준 옵션 정의
  const levelOptions = [
    {
      id: 'beginner',
      name: t('signup.exchangeLanguageLevel.beginner'),
      level: 1,
    },
    {
      id: 'elementary',
      name: t('signup.exchangeLanguageLevel.elementary'),
      level: 2,
    },
    {
      id: 'intermediate',
      name: t('signup.exchangeLanguageLevel.intermediate'),
      level: 3,
    },
    {
      id: 'advanced',
      name: t('signup.exchangeLanguageLevel.advanced'),
      level: 4,
    },
    {
      id: 'proficient',
      name: t('signup.exchangeLanguageLevel.proficient'),
      level: 5,
    },
  ];

  // 선택된 교환 언어의 이름을 가져오는 함수
  const getExchangeLanguageName = () => {
    if (!exchangeLanguage) return '';

    // 교환 언어 값에 따라 적절한 언어 이름을 반환
    return t(`signup.exchangeLanguage.${exchangeLanguage}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="h2"
          weight="semiBold"
          color={colors.richBlack}
          style={styles.title}>
          {t('signup.exchangeLanguageLevel.title', {
            language: getExchangeLanguageName(),
          })}
        </Text>
        <Text variant="body2" color={colors.charcoal} style={styles.subtitle}>
          {t('signup.exchangeLanguageLevel.subtitle')}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {levelOptions.map(level => (
          <LevelButton
            key={level.id}
            label={level.name}
            level={level.level as 1 | 2 | 3 | 4 | 5}
            isSelected={selectedLevel === level.id}
            onPress={() => onLevelSelect(level.id)}
          />
        ))}
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
});

export default ExchangeLanguageLevelSelection;
