import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {ChevronDown} from '../../../shared/assets/images';
import {colors} from '../../../app/styles/colors';
import {Text} from '../../../shared/ui/typography/Text';
import GroupCreateHeader from './components/GroupCreateHeader';

type RouteParams = {
  groupType: string;
};

const MAX_MEMBERS = 10;

const GroupCreateStep2 = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {t} = useTranslation();
  const {groupType} = route.params as RouteParams;
  const insets = useSafeAreaInsets();

  const [myLanguage, setMyLanguage] = useState(
    t('signup.nativeLanguage.korean'),
  );
  const [exchangeLanguage, setExchangeLanguage] = useState(
    t('signup.nativeLanguage.english'),
  );
  const [memberCount, setMemberCount] = useState('8');

  const [showMyLanguageModal, setShowMyLanguageModal] = useState(false);
  const [showExchangeLanguageModal, setShowExchangeLanguageModal] =
    useState(false);
  const [showMemberCountModal, setShowMemberCountModal] = useState(false);

  // 도움 유형이 선택되면 인원수를 2명으로 고정
  useEffect(() => {
    if (groupType === 'help') {
      setMemberCount('2');
    }
  }, [groupType]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // 다음 페이지로 이동
    navigation.navigate('GroupCreateStep3', {
      groupType,
      myLanguage,
      exchangeLanguage,
      memberCount: Number(memberCount),
    });
  };

  const languageOptions = [
    t('signup.nativeLanguage.korean'),
    t('signup.nativeLanguage.english'),
    t('signup.nativeLanguage.japanese'),
    t('signup.nativeLanguage.chinese'),
    t('signup.nativeLanguage.german'),
    t('signup.nativeLanguage.french'),
    t('signup.nativeLanguage.spanish'),
  ];
  const memberCountOptions = Array.from({length: MAX_MEMBERS}, (_, i) =>
    String(i + 1),
  );

  // 도움 유형인지 확인하는 함수
  const isHelpType = groupType === 'help';

  return (
    <SafeAreaView style={styles.container}>
      <GroupCreateHeader title={t('group.create.title')} onBack={handleBack} />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.stepText}>
          {t('group.create.step', {step: 2, total: 4})}
        </Text>

        <Text style={styles.titleText}>
          {isHelpType
            ? t('group.create.step2.title_help')
            : t('group.create.step2.title')}
        </Text>

        {/* 언어 선택 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>
              {t('group.create.step2.language_exchange')}
            </Text>
          </View>

          <View style={styles.languageSelectionRow}>
            <Text style={styles.labelText}>
              {t('group.create.step2.my_language')}
            </Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowMyLanguageModal(true)}>
              <Text style={styles.dropdownButtonText}>{myLanguage}</Text>
              <ChevronDown width={16} height={16} />
            </TouchableOpacity>

            <Text style={styles.labelText}>{t('group.create.step2.and')}</Text>
          </View>

          <View style={styles.languageSelectionRow}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowExchangeLanguageModal(true)}>
              <Text style={styles.dropdownButtonText}>{exchangeLanguage}</Text>
              <ChevronDown width={16} height={16} />
            </TouchableOpacity>

            <Text style={styles.labelText}>
              {t('group.create.step2.will_exchange')}
            </Text>
          </View>
        </View>

        {/* 인원 선택 섹션 - 도움 유형일 때는 표시하지 않음 */}
        {!isHelpType && (
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>
                {t('group.create.step2.member_count')}
              </Text>
            </View>

            <View style={styles.languageSelectionRow}>
              <Text style={styles.labelText}>
                {t('group.create.step2.member_count_prefix')}
              </Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMemberCountModal(true)}>
                <Text style={styles.dropdownButtonText}>
                  {memberCount}
                  {t('group.create.step2.people')}
                </Text>
                <ChevronDown width={16} height={16} />
              </TouchableOpacity>

              <Text style={styles.labelText}>
                {t('group.create.step2.member_count_suffix')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomContainer, Platform.OS === 'android' && {paddingBottom: insets.bottom + 20}]}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>

      {/* 언어 선택 모달 - 내 언어 */}
      <Modal
        transparent={true}
        visible={showMyLanguageModal}
        animationType="fade"
        onRequestClose={() => setShowMyLanguageModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMyLanguageModal(false)}>
          <View style={styles.modalContainer}>
            {languageOptions.map((lang, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalItem,
                  myLanguage === lang && styles.selectedModalItem,
                ]}
                onPress={() => {
                  setMyLanguage(lang);
                  setShowMyLanguageModal(false);
                }}>
                <Text
                  style={[
                    styles.modalItemText,
                    myLanguage === lang && styles.selectedModalItemText,
                  ]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 언어 선택 모달 - 교환 언어 */}
      <Modal
        transparent={true}
        visible={showExchangeLanguageModal}
        animationType="fade"
        onRequestClose={() => setShowExchangeLanguageModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowExchangeLanguageModal(false)}>
          <View style={styles.modalContainer}>
            {languageOptions.map((lang, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalItem,
                  exchangeLanguage === lang && styles.selectedModalItem,
                ]}
                onPress={() => {
                  setExchangeLanguage(lang);
                  setShowExchangeLanguageModal(false);
                }}>
                <Text
                  style={[
                    styles.modalItemText,
                    exchangeLanguage === lang && styles.selectedModalItemText,
                  ]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 인원 선택 모달 */}
      <Modal
        transparent={true}
        visible={showMemberCountModal}
        animationType="fade"
        onRequestClose={() => setShowMemberCountModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMemberCountModal(false)}>
          <View style={styles.modalContainer}>
            {memberCountOptions.map((count, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalItem,
                  memberCount === count && styles.selectedModalItem,
                ]}
                onPress={() => {
                  setMemberCount(count);
                  setShowMemberCountModal(false);
                }}>
                <Text
                  style={[
                    styles.modalItemText,
                    memberCount === count && styles.selectedModalItemText,
                  ]}>
                  {count}
                  {t('group.create.step2.people')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 32,
    marginLeft: 19,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 19,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionTitleText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  labelText: {
    color: colors.charcoal,
    fontSize: 16,
    marginHorizontal: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.lightSilver,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  dropdownButtonText: {
    color: colors.charcoal,
    fontSize: 16,
    marginRight: 8,
  },
  bottomContainer: {
    paddingHorizontal: 19,
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: colors.batteryChargedBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedModalItem: {
    backgroundColor: '#F4FCFD',
  },
  modalItemText: {
    color: colors.charcoal,
    fontSize: 16,
  },
  selectedModalItemText: {
    color: colors.batteryChargedBlue,
    fontWeight: 'bold',
  },
});

export default GroupCreateStep2;
