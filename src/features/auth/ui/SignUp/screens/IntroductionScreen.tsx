import React, {useState} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import {Text} from '@shared/ui/typography';
import {colors} from '@app/styles/colors';
import {useTranslation} from 'react-i18next';

interface IntroductionScreenProps {
  introduction: string;
  onIntroductionChange: (value: string) => void;
}

const IntroductionScreen: React.FC<IntroductionScreenProps> = ({
  introduction,
  onIntroductionChange,
}) => {
  const {t} = useTranslation();
  const [inputText, setInputText] = useState(introduction);
  const MAX_LENGTH = 50;

  const handleTextChange = (text: string) => {
    if (text.length <= MAX_LENGTH) {
      setInputText(text);
      onIntroductionChange(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text
          variant="h2"
          weight="semiBold"
          color={colors.richBlack}
          style={styles.title}>
          {t('signup.introduction.title', '본인을 한 줄로 소개해보세요 :)')}
        </Text>
        <Text variant="caption" color={colors.charcoal} style={styles.subtitle}>
          {t(
            'signup.introduction.subtitle',
            '공백 포함 {{maxLength}}자까지 입력 가능해요.',
            {maxLength: MAX_LENGTH},
          )}
        </Text>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder={t(
            'signup.introduction.placeholder',
            '나를 한 줄로 표현해보세요',
          )}
          maxLength={MAX_LENGTH}
        />
        <View style={styles.divider} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 418,
  },
  headerSection: {
    marginBottom: 64,
  },
  headerLogo: {
    height: 37,
    marginBottom: 20,
  },
  subLogo: {
    height: 20,
    marginBottom: 59,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {},
  inputSection: {},
  label: {
    color: colors.auroMetalSaurus,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: colors.richBlack,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightSilver,
  },
});

export default IntroductionScreen;
