import React, {useState} from 'react';
import {View, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ChevronLeft,
  HelpIcon,
  SocialIcon,
  StudyIcon,
} from '../../../shared/assets/images';
import {colors} from '../../../app/styles/colors';
import {Text} from '../../../shared/ui/typography/Text';

const GroupCreate = () => {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (selectedType) {
      // 다음 페이지(Step2)로 이동
      navigation.navigate('GroupCreateStep2', {groupType: selectedType});
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('group.create.title')}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.stepText}>
          {t('group.create.step', {step: 1, total: 4})}
        </Text>

        <Text style={styles.titleText}>{t('group.create.selectType')}</Text>

        {/* 친목 유형 */}
        <TouchableOpacity
          style={[
            styles.typeContainer,
            selectedType === 'social' && styles.selectedType,
          ]}
          onPress={() => handleSelectType('social')}>
          <View style={styles.typeContent}>
            <Text style={styles.typeTitle}>{t('group.categories.social')}</Text>
            <Text style={styles.typeDescription}>
              {t('group.create.social.description')}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <SocialIcon style={styles.typeIcon} />
          </View>
        </TouchableOpacity>

        {/* 공부 유형 */}
        <TouchableOpacity
          style={[
            styles.typeContainer,
            selectedType === 'study' && styles.selectedType,
          ]}
          onPress={() => handleSelectType('study')}>
          <View style={styles.typeContent}>
            <Text style={styles.typeTitle}>{t('group.categories.study')}</Text>
            <Text style={styles.typeDescription}>
              {t('group.create.study.description')}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <StudyIcon style={styles.typeIcon} />
          </View>
        </TouchableOpacity>

        {/* 도움 유형 */}
        <TouchableOpacity
          style={[
            styles.typeContainer,
            selectedType === 'help' && styles.selectedType,
          ]}
          onPress={() => handleSelectType('help')}>
          <View style={styles.typeContent}>
            <Text style={styles.typeTitle}>{t('group.categories.help')}</Text>
            <Text style={styles.typeDescription}>
              {t('group.create.help.description')}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <HelpIcon style={styles.typeIcon} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.bottomContainer, Platform.OS === 'android' && {paddingBottom: insets.bottom + 24}]}>
        <TouchableOpacity
          style={[styles.nextButton, selectedType ? styles.activeButton : null]}
          disabled={!selectedType}
          onPress={handleNext}>
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginHorizontal: 17,
    position: 'relative',
  },
  backButton: {
    padding: 10, // 터치 영역 확장
    marginLeft: -10, // 왼쪽 여백 조정
    zIndex: 10, // 다른 요소 위에 올라오게 설정
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    color: colors.darkCharcoal,
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  stepText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 26,
    marginLeft: 19,
  },
  titleText: {
    color: colors.darkCharcoal,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 48,
    marginLeft: 19,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.lightSilver,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 23,
    paddingHorizontal: 22,
    marginBottom: 28,
    marginHorizontal: 19,
  },
  selectedType: {
    borderColor: colors.batteryChargedBlue,
    backgroundColor: '#F4FCFD',
    borderWidth: 1,
  },
  typeContent: {
    flex: 1,
    marginVertical: 1,
    marginRight: 12,
  },
  typeTitle: {
    color: colors.charcoal,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  typeDescription: {
    color: '#384050',
    fontSize: 12,
  },
  iconContainer: {
    backgroundColor: '#FAFCFF',
    borderColor: colors.lightSilver,
    borderRadius: 24,
    borderWidth: 1,
    padding: 9,
  },
  typeIcon: {
    width: 52,
    height: 52,
  },
  bottomContainer: {
    paddingHorizontal: 19,
    paddingBottom: 24,
  },
  nextButton: {
    backgroundColor: '#BBECF4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.batteryChargedBlue,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupCreate;
