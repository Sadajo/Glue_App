import React from 'react';
import {SafeAreaView, View, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {ChevronLeft} from '@shared/assets/images';

const SettingsHeader: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
          <ChevronLeft width={24} height={24} color="#1CBFDC" />
        </TouchableOpacity>

        {/* 타이틀 */}
        <Text style={styles.title}>{t('settings.title') || '설정'}</Text>

        {/* 우측 빈 공간 (균형을 위해) */}
        <View style={styles.placeholder} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 19,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32, // 뒤로가기 버튼과 같은 크기로 균형 맞춤
  },
});

export default SettingsHeader;
