import React from 'react';
import {SafeAreaView, View, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {ChevronLeft} from '@shared/assets/images';

const ProfileEditHeader: React.FC = () => {
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
        <Text style={styles.title}>{t('profile.editProfile.title')}</Text>

        {/* 우측 빈 공간 (균형을 위해) */}
        <View style={styles.placeholder} />
      </View>
    </SafeAreaView>
  );
};

export default ProfileEditHeader;

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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'semibold',
    color: '#1C1C1E',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
});
