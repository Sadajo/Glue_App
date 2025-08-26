// src/features/Profile/ui/ProfileEditScreen.tsx
import React, {useState} from 'react';
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Text} from '@shared/ui/typography/Text';
import {useMyPage} from '../model/useMyPage';
import {useProfileMe} from '../model/useProfileMe';
import {styles} from './styles/ProfileEdit.styles';
import {useTranslation} from 'react-i18next';
import {changeLanguage, Language, LANGUAGE_NAMES} from '@shared/lib/i18n';
import {CenterModal, CenterModalOption} from '@shared/ui/CenterModal';
import ProfileEditHeader from '@widgets/header/ui/ProfileEditHeader';
import CameraIcon from '@shared/assets/images/camera.svg';
import {dummyProfile} from '@shared/assets/images';
import {useProfileImageUploadAndUpdate} from '@shared/lib/api/profileImageHooks';
import {getDepartmentNameById} from '../../auth/ui/SignUp/data/departments';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  Permission,
  openSettings,
} from 'react-native-permissions';

const ProfileEditScreen = () => {
  const navigation = useNavigation<any>();
  const {myPageInfo, isLoading, isError, error} = useMyPage();
  const {
    data: profileMe,
    isLoading: isProfileMeLoading,
    isError: isProfileMeError,
    error: profileMeError,
  } = useProfileMe();
  const {t, i18n} = useTranslation();
  const profileImageUpload = useProfileImageUploadAndUpdate();

  // 편집 가능한 필드들의 상태
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  // 기본 프로필 이미지 (더미 이미지 사용)
  const defaultAvatar = dummyProfile;

  // 언어 옵션 생성
  const languageOptions: CenterModalOption[] = [
    {
      label: LANGUAGE_NAMES[Language.KOREAN],
      value: Language.KOREAN,
    },
    {
      label: LANGUAGE_NAMES[Language.ENGLISH],
      value: Language.ENGLISH,
    },
  ];

  // 언어 변경 핸들러
  const handleLanguageChange = async (option: CenterModalOption) => {
    try {
      const success = await changeLanguage(option.value as Language);
      if (success) {
        console.log(`${t('settings.languageChanged')}: ${option.label}`);
        // 언어 변경 성공 시 추가 동작을 여기에 구현할 수 있습니다
        // 예: Toast 메시지 표시, 앱 재시작 등
      }
    } catch (languageError) {
      console.error('언어 변경 중 오류:', languageError);
    }
  };

  // 프로필 이미지 선택 핸들러
  const handleSelectProfileImage = () => {
    Alert.alert(
      t('common.select'),
      t('profile.editProfile.selectProfileImageOption'),
      [
        {
          text: t('profile.editProfile.camera'),
          onPress: () => checkPermissionAndProceed('camera'),
        },
        {
          text: t('profile.editProfile.gallery'),
          onPress: () => checkPermissionAndProceed('gallery'),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  // 권한 확인 및 처리
  const checkPermissionAndProceed = async (type: 'camera' | 'gallery') => {
    try {
      let permission: Permission;

      if (type === 'camera') {
        permission =
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;
      } else {
        // 갤러리 권한 설정
        if (Platform.OS === 'ios') {
          permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
        } else {
          // Android 13 이상에서는 READ_MEDIA_IMAGES, 이하에서는 READ_EXTERNAL_STORAGE
          permission =
            Number(Platform.Version) >= 33
              ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
              : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        }
      }

      const result = await check(permission);

      switch (result) {
        case RESULTS.UNAVAILABLE:
          Alert.alert(t('common.error'), t('profile.editProfile.unavailable'));
          break;
        case RESULTS.DENIED:
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED) {
            type === 'camera' ? openCamera() : openGallery();
          }
          break;
        case RESULTS.LIMITED:
        case RESULTS.GRANTED:
          type === 'camera' ? openCamera() : openGallery();
          break;
        case RESULTS.BLOCKED:
          Alert.alert(
            t('common.permission'),
            t('profile.editProfile.blocked'),
            [
              {
                text: t('common.ok'),
                onPress: () => console.log('사용자가 설정으로 이동하지 않음'),
              },
              {
                text: t('profile.editProfile.goToSettings'),
                onPress: () => {
                  openSettings().catch(() =>
                    Alert.alert(
                      t('common.error'),
                      t('profile.editProfile.settingsError'),
                    ),
                  );
                },
              },
            ],
          );
          break;
      }
    } catch (error) {
      console.log('권한 확인 중 오류 발생:', error);
      Alert.alert(t('common.error'), t('profile.editProfile.generalError'));
    }
  };

  // 카메라 열기
  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 500,
        maxWidth: 500,
      },
      (response: ImagePickerResponse) => {
        handleImagePickerResponse(response);
      },
    );
  };

  // 갤러리 열기
  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 500,
        maxWidth: 500,
      },
      (response: ImagePickerResponse) => {
        handleImagePickerResponse(response);
      },
    );
  };

  // 이미지 선택 응답 처리
  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('사용자가 이미지 선택을 취소했습니다');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert(t('common.error'), t('profile.editProfile.imagePickerError'));
    } else if (response.assets && response.assets.length > 0) {
      const selectedAsset: Asset = response.assets[0];
      const uri = selectedAsset.uri;

      if (uri) {
        // 로컬 이미지 미리보기 설정
        setLocalImageUri(uri);

        // 서버에 업로드
        uploadProfileImage(uri);
      }
    }
  };

  // 프로필 이미지 업로드
  const uploadProfileImage = async (imageUri: string) => {
    try {
      console.log('🔥🔥🔥 [프로필 이미지 업로드 시작] 🔥🔥🔥');
      console.log('📱 원본 이미지 URI:', imageUri);
      console.log('🎯 리사이저 설정:', {
        maxWidth: 800,
        maxHeight: 800,
        quality: 90,
        적용상태: 'ENABLED',
      });

      // URL 안전한 파일명 생성 (한글, 특수문자 제거)
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `profile_${timestamp}_${randomId}.jpg`;

      console.log('🔧 URL 안전 파일명:', fileName);
      console.log('⏳ profileImageUpload.mutateAsync 호출 중...');

      await profileImageUpload.mutateAsync({
        imageUri,
        fileName,
        maxWidth: 800, // 프로필 이미지는 좀 더 작게
        maxHeight: 800, // 프로필 이미지는 좀 더 작게
        quality: 90, // 프로필은 품질을 좀 더 높게
      });

      console.log('✅✅✅ [프로필 이미지 업로드 완료] ✅✅✅');

      Alert.alert(
        t('common.success'),
        t('profile.editProfile.imageUploadSuccess'),
      );
    } catch (error) {
      console.error('💥💥💥 [프로필 이미지 업로드 실패] 💥💥💥', error);
      Alert.alert(t('common.error'), t('profile.editProfile.imageUploadError'));
      // 업로드 실패 시 로컬 이미지 상태 되돌리기
      setLocalImageUri(null);
    }
  };

  // 로딩 상태 (두 API 모두 로딩 중인지 확인)
  if (isLoading || isProfileMeLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {t('profile.editProfile.loadingProfile')}
          </Text>
        </View>
      </View>
    );
  }

  // 에러 상태 (두 API 중 하나라도 에러인지 확인)
  if (isError || isProfileMeError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message ||
              profileMeError?.message ||
              t('profile.editProfile.loadProfileError')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileEditHeader />
      <ScrollView contentContainerStyle={styles.content}>
        {/* 프로필 이미지 및 닉네임 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                localImageUri
                  ? {uri: localImageUri}
                  : profileMe?.profileImageUrl || myPageInfo?.profileImageUrl
                  ? {
                      uri:
                        profileMe?.profileImageUrl ||
                        myPageInfo?.profileImageUrl,
                    }
                  : defaultAvatar
              }
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleSelectProfileImage}
              disabled={profileImageUpload.isPending}>
              {profileImageUpload.isPending ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <CameraIcon width={16} height={16} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.nickname}>
            {profileMe?.nickName ||
              myPageInfo?.userNickname ||
              t('profile.defaultUser')}
          </Text>
        </View>

        {/* 한줄소개 섹션 */}
        <View style={styles.descriptionCard}>
          <View style={styles.descriptionCardHeader}>
            <Text style={styles.descriptionCardTitle}>
              {t('profile.editProfile.introduction')}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('DescriptionEdit', {
                  initialDescription:
                    profileMe?.description || myPageInfo?.description || '',
                })
              }>
              <Text style={styles.editButtonText}>{t('common.edit')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.descriptionCardContent}>
            {profileMe?.description ||
              myPageInfo?.description ||
              t('profile.editProfile.defaultIntroduction')}
          </Text>
        </View>

        {/* 기본 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.editProfile.basicInfo')}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('profile.editProfile.name')}
            </Text>
            <Text style={styles.infoValue}>
              {profileMe?.realName || '김우주'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('profile.editProfile.nickname')}
            </Text>
            <Text style={styles.infoValue}>
              {profileMe?.nickName ||
                myPageInfo?.userNickname ||
                t('profile.defaultUser')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('profile.editProfile.birthDate')}
            </Text>
            <Text style={styles.infoValue}>
              {profileMe?.birthDate || '2002.04.08'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('profile.editProfile.gender')}
            </Text>
            <Text style={styles.infoValue}>
              {profileMe?.gender === 1
                ? t('profile.editProfile.male')
                : t('profile.editProfile.female')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.systemLanguage')}</Text>
            <View style={styles.infoRowRight}>
              <Text style={[styles.infoValue, {paddingLeft: 0}]}>
                {LANGUAGE_NAMES[i18n.language as Language] ||
                  LANGUAGE_NAMES[Language.KOREAN]}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsLanguageModalVisible(true)}>
                <Text style={styles.editButtonText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 학교 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.editProfile.schoolInfo')}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('profile.editProfile.school')}
            </Text>
            <Text style={styles.infoValue}>부산대학교</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('profile.editProfile.department')}
            </Text>
            <Text style={styles.infoValue}>
              {profileMe?.major
                ? getDepartmentNameById(profileMe.major, i18n.language)
                : t('profile.editProfile.notSet')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('profile.editProfile.email')}
            </Text>
            <Text style={styles.infoValue}>
              {profileMe?.email || 'abcdefg1234@pusan.ac.kr'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 언어 선택 모달 */}
      <CenterModal
        title={
          t('settings.systemLanguageSelect') || '시스템 언어를 선택해 주세요.'
        }
        options={languageOptions}
        isVisible={isLanguageModalVisible}
        onClose={() => setIsLanguageModalVisible(false)}
        onSelect={handleLanguageChange}
        selectedValue={i18n.language}
      />
    </View>
  );
};

export default ProfileEditScreen;
