import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors} from '@app/styles/colors';
import SelectionButton from '@shared/ui/SelectionButton';
import {Text} from '@shared/ui/typography/Text';

type GenderSelectionProps = {
  selectedGender: string | null;
  onGenderSelect: (gender: string) => void;
};

const GenderSelection = ({
  selectedGender,
  onGenderSelect,
}: GenderSelectionProps) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="h2"
          weight="semiBold"
          color={colors.richBlack}
          style={styles.title}>
          {t('signup.gender.title')}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <SelectionButton
          label={t('signup.gender.male')}
          isSelected={selectedGender === 'male'}
          onPress={() => onGenderSelect('male')}
        />

        <SelectionButton
          label={t('signup.gender.female')}
          isSelected={selectedGender === 'female'}
          onPress={() => onGenderSelect('female')}
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
    marginBottom: 30,
  },
});

export default GenderSelection;
