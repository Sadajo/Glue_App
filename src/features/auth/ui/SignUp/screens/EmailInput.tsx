import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {colors} from '@app/styles/colors';
import {useTranslation} from 'react-i18next';
import {Text} from '@shared/ui/typography/Text';

type EmailInputProps = {
  onEmailChange: (email: string) => void;
  initialEmail?: string;
  onValidityChange?: (isValid: boolean) => void;
};

const EmailInput = ({
  onEmailChange,
  initialEmail = '',
  onValidityChange,
}: EmailInputProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {t} = useTranslation();

  // 이메일 유효성 검사 - @pusan.ac.kr 도메인만 허용
  const isValidEmail = (email: string) => {
    const pusanEmailRegex = /^[^\s@]+@pusan\.ac\.kr$/;

    return pusanEmailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    onEmailChange(text);

    // 이메일이 비어있지 않고 pusan.ac.kr이 아닐 경우 에러 메시지 표시
    if (text && !isValidEmail(text)) {
      setErrorMessage(t('signup.email.error.invalidDomain'));
    } else {
      setErrorMessage('');
    }

    // 유효성 상태를 상위 컴포넌트에 전달
    if (onValidityChange) {
      onValidityChange(isValidEmail(text));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="h2"
          weight="semiBold"
          color={colors.richBlack}
          style={styles.title}>
          {t('signup.email.title')}
        </Text>
        <Text variant="body2" color={colors.charcoal} style={styles.subtitle}>
          {t('signup.email.subtitle')}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={email}
          onChangeText={handleEmailChange}
          placeholder={t('signup.email.placeholder')}
          placeholderTextColor={colors.manatee}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View
          style={[
            styles.inputBorder,
            {
              borderColor: isFocused
                ? colors.batteryChargedBlue
                : errorMessage
                ? 'red'
                : colors.lightSilver,
            },
          ]}
        />
        {errorMessage ? (
          <Text variant="body2" color={'red'} style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : (
          <Text variant="body2" color={colors.charcoal} style={styles.notice}>
            {t('signup.email.notice')}
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
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
  subtitle: {
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: 40,
  },
  label: {
    color: colors.auroMetalSaurus,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 0,
    color: colors.richBlack,
  },
  inputBorder: {
    height: 1,
    backgroundColor: colors.lightSilver,
    marginBottom: 8,
  },
  notice: {
    textAlign: 'left',
    fontSize: 12,
  },
  errorText: {
    textAlign: 'left',
    fontSize: 12,
  },
});

export default EmailInput;
