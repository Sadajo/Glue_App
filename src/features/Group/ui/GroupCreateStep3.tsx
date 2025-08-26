import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {colors} from '../../../app/styles/colors';
import {Text} from '../../../shared/ui/typography/Text';
import {CameraIcon} from '../../../shared/assets/images';
import GroupCreateHeader from './components/GroupCreateHeader';
import {toastService} from '../../../shared/lib/notifications/toast';
import {useImageUpload} from '../../../shared/lib/api/uploadHooks';

const GroupCreateStep3 = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: number]: boolean;
  }>({});

  // 이미지 업로드 훅
  const {mutate: uploadImage} = useImageUpload();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // route.params가 존재하는지 확인 후 사용
    const routeParams = route.params || {};

    // 다음 페이지로 이동 - 업로드된 이미지 URL들을 전달
    navigation.navigate('GroupCreateStep4', {
      ...routeParams,
      groupTitle: title,
      groupContent: content,
      imageUrls: uploadedImageUrls,
    });
  };

  const checkAndRequestPermission = async () => {
    // iOS와 Android의 권한 체크 로직이 다름
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

    try {
      const result = await check(permission);

      switch (result) {
        case RESULTS.GRANTED:
          return true;
        case RESULTS.DENIED:
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        case RESULTS.BLOCKED:
          toastService.error(
            t('common.permission_required'),
            t('common.photo_permission_blocked'),
          );
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error(t('common.permission_check_error'), error);
      return false;
    }
  };

  const handleAddImage = async () => {
    // 최대 5장까지만 업로드 가능
    if (images.length >= 5) {
      toastService.error(
        t('common.error'),
        '최대 5장까지만 업로드할 수 있습니다.',
      );
      return;
    }

    const hasPermission = await checkAndRequestPermission();

    if (!hasPermission) {
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log(t('group.create.step3.image_cancel'));
      } else if (response.errorCode) {
        console.log(t('group.create.step3.image_error'), response.errorMessage);
        toastService.error(
          t('common.error'),
          t('group.create.step3.image_selection_error'),
        );
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        if (selectedImage.uri) {
          // 이미지를 로컬 배열에 추가
          const newImages = [...images, selectedImage.uri];
          setImages(newImages);

          // 즉시 S3에 업로드 시작
          uploadImageToS3(selectedImage.uri, newImages.length - 1);
        }
      }
    });
  };

  const uploadImageToS3 = async (imageUri: string, index: number) => {
    console.log(`[이미지 업로드 시작] 인덱스: ${index}, URI: ${imageUri}`);

    // 업로드 시작 상태 설정
    setUploadingImages(prev => ({...prev, [index]: true}));

    // URL 안전한 파일명 생성 (한글, 특수문자 제거)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `post_${timestamp}_${index}_${randomId}.jpg`;

    console.log(`[이미지 업로드] 파일명: ${fileName}, 버킷: post_images`);

    uploadImage(
      {
        bucketObject: 'post_images',
        imageUri: imageUri,
        fileName: fileName,
        maxWidth: 1200, // 최대 가로 크기
        maxHeight: 1200, // 최대 세로 크기
        quality: 85, // 품질 (0-100, 높을수록 좋은 품질)
      },
      {
        onSuccess: (publicUrl: string) => {
          console.log(
            `[이미지 업로드 성공] 인덱스: ${index}, 공개 URL: ${publicUrl}`,
          );

          // 업로드된 URL을 배열에 추가
          setUploadedImageUrls(prev => {
            const newUrls = [...prev];
            newUrls[index] = publicUrl;
            console.log(`[업로드된 이미지 URLs 업데이트]`, newUrls);
            return newUrls;
          });

          // 업로드 완료 상태 설정
          setUploadingImages(prev => {
            const newState = {...prev};
            delete newState[index];
            return newState;
          });

          toastService.success(`이미지 ${index + 1}이 업로드되었습니다.`);
        },
        onError: (error: Error) => {
          console.error(`[이미지 업로드 실패] 인덱스: ${index}, 오류:`, error);

          // 업로드 실패 시 이미지 제거
          setImages(prev => {
            const filtered = prev.filter((_, i) => i !== index);
            console.log(`[이미지 제거 후 남은 이미지들]`, filtered);
            return filtered;
          });

          // 업로드 상태 제거
          setUploadingImages(prev => {
            const newState = {...prev};
            delete newState[index];
            return newState;
          });

          toastService.error(
            '이미지 업로드 실패',
            error.message || '다시 시도해주세요.',
          );
        },
      },
    );
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));

    // 업로드 중인 상태도 제거
    setUploadingImages(prev => {
      const newState = {...prev};
      delete newState[index];
      return newState;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <GroupCreateHeader title={t('group.create.title')} onBack={handleBack} />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.stepText}>
          {t('group.create.step', {step: 3, total: 4})}
        </Text>

        <Text style={styles.titleText}>{t('group.create.step3.title')}</Text>

        {/* 제목 입력 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t('group.create.step3.group_name_title')}
          </Text>
          <TextInput
            style={styles.titleInput}
            placeholder={t('group.create.step3.group_name_placeholder')}
            placeholderTextColor={colors.manatee}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t('group.create.step3.detail_content')}
          </Text>
          <TextInput
            style={styles.contentInput}
            placeholder={t('group.create.step3.detail_content_placeholder')}
            placeholderTextColor={colors.manatee}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            numberOfLines={8}
            maxLength={500}
          />
        </View>

        {/* 사진 추가 */}
        <View style={styles.imageContainer}>
          <View style={styles.imageGrid}>
            {images.map((imageUri, index) => (
              <View key={index} style={styles.previewContainer}>
                <Image
                  source={{uri: imageUri}}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                {uploadingImages[index] && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color={colors.white} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}>
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* 이미지 추가 버튼 (5장 미만일 때만 표시) */}
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleAddImage}>
                <View style={styles.addImageContent}>
                  <CameraIcon style={styles.cameraIcon} />
                  <Text style={styles.addImageText}>{images.length}/5</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, Platform.OS === 'android' && {paddingBottom: insets.bottom + 20}]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            title.trim() !== '' &&
            content.trim() !== '' &&
            Object.keys(uploadingImages).length === 0
              ? styles.activeButton
              : styles.inactiveButton,
          ]}
          disabled={
            title.trim() === '' ||
            content.trim() === '' ||
            Object.keys(uploadingImages).length > 0
          }
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
  inputContainer: {
    marginBottom: 24,
    paddingHorizontal: 19,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: 8,
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.charcoal,
  },
  contentInput: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 14,
    color: colors.charcoal,
  },
  imageContainer: {
    paddingHorizontal: 19,
    marginBottom: 30,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addImageContent: {
    alignItems: 'center',
  },
  cameraIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 12,
    color: colors.manatee,
  },
  previewContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.darkCharcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 19,
    paddingBottom: 20,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.batteryChargedBlue,
  },
  inactiveButton: {
    backgroundColor: '#BBECF4',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupCreateStep3;
