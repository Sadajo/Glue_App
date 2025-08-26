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

type NicknameInputProps = {
  onNicknameChange: (nickname: string) => void;
  initialNickname?: string;
  onNicknameCheck?: (nickname: string) => Promise<boolean>;
};

const NicknameInput = ({
  onNicknameChange,
  initialNickname = '',
  onNicknameCheck,
}: NicknameInputProps) => {
  const [nickname, setNickname] = useState(initialNickname);
  const [isFocused, setIsFocused] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const {t} = useTranslation();

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    onNicknameChange(text);
    // 닉네임이 변경되면 중복 상태 초기화
    setIsDuplicate(false);
  };

  // 포커스가 벗어날 때 닉네임 중복 확인
  const handleBlur = async () => {
    setIsFocused(false);
    if (nickname.trim() !== '' && onNicknameCheck) {
      const isDup = await onNicknameCheck(nickname);
      setIsDuplicate(isDup);
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
          {t('signup.nickname.title')}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={nickname}
          onChangeText={handleNicknameChange}
          placeholder={t('signup.nickname.placeholder')}
          placeholderTextColor={colors.manatee}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View
          style={[
            styles.inputBorder,
            {
              borderColor: isDuplicate
                ? '#E66B6F'
                : isFocused
                ? colors.batteryChargedBlue
                : colors.lightSilver,
            },
          ]}
        />
        {isDuplicate && (
          <Text variant="caption" color="#E66B6F" style={styles.errorText}>
            {t('signup.nickname.duplicate')}
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
  inputContainer: {
    marginBottom: 40,
  },
  label: {
    color: colors.auroMetalSaurus,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 7,
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
    marginBottom: 11,
  },
  errorText: {
    fontSize: 12,
  },
});

export default NicknameInput;
