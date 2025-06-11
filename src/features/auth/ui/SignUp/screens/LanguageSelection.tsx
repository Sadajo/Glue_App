import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '@app/styles/colors';
import {useTranslation} from 'react-i18next';
import SelectionButton from '@shared/ui/SelectionButton';
import {Text} from '@shared/ui/typography/Text';

type LanguageSelectionProps = {
  onLanguageSelect: (language: string) => void;
  initialLanguage?: string | null;
};

const LanguageSelection = ({
  onLanguageSelect,
  initialLanguage = 'korean',
}: LanguageSelectionProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    initialLanguage,
  );
  const {t} = useTranslation();

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    onLanguageSelect(language);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="h2"
          weight="semiBold"
          color={colors.richBlack}
          style={styles.title}>
          {t('signup.language.title')}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <SelectionButton
          label={t('signup.language.korean')}
          isSelected={selectedLanguage === 'korean'}
          onPress={() => handleLanguageSelect('korean')}
        />

        <SelectionButton
          label={t('signup.language.english')}
          isSelected={selectedLanguage === 'english'}
          onPress={() => handleLanguageSelect('english')}
        />
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
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 40,
  },
});

export default LanguageSelection;
