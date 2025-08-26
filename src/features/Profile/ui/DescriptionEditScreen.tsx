import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {ChevronLeft} from '@shared/assets/images';
import {useUpdateDescription} from '../model/useUpdateDescription';
import {useMyPage} from '../model/useMyPage';
import {useProfileMe} from '../model/useProfileMe';
import {StyleSheet} from 'react-native';

type DescriptionEditRouteProps = RouteProp<
  {DescriptionEdit: {initialDescription?: string}},
  'DescriptionEdit'
>;

const DescriptionEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<DescriptionEditRouteProps>();
  const {t} = useTranslation();

  const {myPageInfo} = useMyPage();
  const {data: profileMe} = useProfileMe();
  const updateDescriptionMutation = useUpdateDescription();

  const [description, setDescription] = useState('');

  // 초기 description 설정
  useEffect(() => {
    const initialDesc =
      route.params?.initialDescription ||
      profileMe?.description ||
      myPageInfo?.description ||
      '';
    setDescription(initialDesc);
  }, [
    route.params?.initialDescription,
    profileMe?.description,
    myPageInfo?.description,
  ]);

  // 저장 처리
  const handleSave = async () => {
    if (description.trim().length === 0) {
      Alert.alert(
        t('common.error'),
        t('profile.editProfile.introductionPlaceholder'),
      );
      return;
    }

    if (description.length > 50) {
      Alert.alert(t('common.error'), '한 줄 소개는 50자 이내로 입력해주세요.');
      return;
    }

    try {
      await updateDescriptionMutation.mutateAsync(description.trim());
      Alert.alert(
        t('common.success'),
        '한 줄 소개가 성공적으로 수정되었습니다.',
        [
          {
            text: t('common.confirm'),
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error
          ? error.message
          : '한 줄 소개 수정에 실패했습니다.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
          <ChevronLeft width={24} height={24} color="#1CBFDC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('profile.editProfile.introduction')}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={updateDescriptionMutation.isPending}>
          {updateDescriptionMutation.isPending ? (
            <ActivityIndicator size="small" color="#1CBFDC" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {t('profile.editProfile.introduction')}
          </Text>
          <Text style={styles.description}>
            자신을 한 줄로 소개해보세요 (최대 50자)
          </Text>

          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder={t('profile.editProfile.introductionPlaceholder')}
            multiline
            numberOfLines={3}
            maxLength={50}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>{description.length}/50</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1CBFDC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: '#F8F9FA',
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default DescriptionEditScreen;
