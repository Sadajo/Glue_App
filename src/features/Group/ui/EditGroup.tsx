import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Postcode from '@actbase/react-daum-postcode';
import {colors, semanticColors} from '../../../app/styles/colors';
import {Text} from '../../../shared/ui/typography/Text';
import {BackButtonHeader} from '../../../widgets/header/ui';
import {CalendarOpacityIcon, ClockIcon} from '../../../shared/assets/images';
import {useUpdateGroupPost, useGroupDetail} from '../api/hooks';
import {toastService} from '../../../shared/lib/notifications/toast';
import {UpdateGroupPostRequest} from '../api/api';

// Daum Postcode 결과 데이터 타입
interface DaumPostcodeResult {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  jibunAddress: string;
  roadAddress: string;
  zonecode: string | number;
  [key: string]: any;
}

// 라우트 파라미터 타입 정의
interface RouteParams {
  postId: string | number;
}

const EditGroup = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {t} = useTranslation();
  const params = route.params as RouteParams;

  const postId = Number(params.postId);

  // 기존 게시글 데이터 조회
  const {
    data: groupDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
  } = useGroupDetail(postId);

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>('');
  const [maxParticipants, setMaxParticipants] = useState<number>(1);
  const [mainLanguageId, setMainLanguageId] = useState<number>(1);
  const [exchangeLanguageId, setExchangeLanguageId] = useState<number>(2);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [_showMainLanguageModal, _setShowMainLanguageModal] =
    useState<boolean>(false);
  const [_showExchangeLanguageModal, _setShowExchangeLanguageModal] =
    useState<boolean>(false);

  // 언어 옵션 (향후 언어 선택 기능 구현 시 사용)
  // const _languageOptions = [
  //   {id: 1, name: '한국어'},
  //   {id: 2, name: '영어'},
  //   {id: 3, name: '일본어'},
  //   {id: 4, name: '중국어'},
  //   {id: 5, name: '스페인어'},
  //   {id: 6, name: '프랑스어'},
  //   {id: 7, name: '독일어'},
  //   {id: 8, name: '이탈리아어'},
  //   {id: 9, name: '포르투갈어'},
  //   {id: 10, name: '러시아어'},
  // ];

  // 언어 이름 가져오기 함수 (향후 언어 선택 기능 구현 시 사용)
  // const _getLanguageName = (id: number) => {
  //   const language = _languageOptions.find(lang => lang.id === id);
  //   return language ? language.name : '언어 선택';
  // };

  // API 호출을 위한 훅 사용
  const {mutate: updatePost, isPending: isUpdatingPost} = useUpdateGroupPost();

  // 기존 데이터로 초기화
  useEffect(() => {
    if (groupDetail?.data?.meeting && groupDetail?.data?.post) {
      const {meeting, post} = groupDetail.data;
      setTitle(post.title || '');
      setContent(post.content || '');
      setDate(new Date(meeting.meetingTime || new Date()));
      setTempDate(new Date(meeting.meetingTime || new Date()));
      setLocation(meeting.meetingPlaceName || '');
      setMaxParticipants(meeting.maxParticipants || 1);
      setMainLanguageId(meeting.mainLanguageId || 1);
      setExchangeLanguageId(meeting.exchangeLanguageId || 2);
    }
  }, [groupDetail]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (
      title.trim() === '' ||
      content.trim() === '' ||
      location.trim() === ''
    ) {
      toastService.error(t('common.error'), '모든 필수 항목을 입력해주세요.');
      return;
    }

    // 현재 시간 + 3시간을 최소 시간으로 설정
    const minimumTime = new Date();
    minimumTime.setHours(minimumTime.getHours() + 3);

    if (date <= minimumTime) {
      toastService.error(
        t('common.error'),
        '모임 시간은 현재 시간으로부터 최소 3시간 이후여야 합니다.',
      );
      return;
    }

    const updateData: UpdateGroupPostRequest = {
      meeting: {
        meetingTitle: title,
        meetingPlaceName: location,
        meetingTime: date.toISOString().slice(0, 19),
        mainLanguageId,
        exchangeLanguageId,
        maxParticipants,
      },
      post: {
        title,
        content,
        imageUrls: groupDetail?.data?.post?.imageUrls || [],
      },
    };

    updatePost(
      {postId, data: updateData},
      {
        onSuccess: () => {
          toastService.success(
            t('common.success'),
            '게시글이 성공적으로 수정되었습니다.',
          );
          navigation.goBack();
        },
        onError: (error: any) => {
          toastService.error(
            t('common.error'),
            error.message || '게시글 수정에 실패했습니다.',
          );
        },
      },
    );
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setTempDate(selectedDate);
    }
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setTempDate(selectedDate);
    }
  };

  const handleAddressSelect = (data: DaumPostcodeResult) => {
    setLocation(data.roadAddress || data.address);
    setShowAddressModal(false);
  };

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return '날짜 선택';
    }
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return '시간 선택';
    }
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (isLoadingDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader title="게시글 수정" onBackPress={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={semanticColors.primary} />
          <Text style={styles.loadingText}>게시글 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isErrorDetail || !groupDetail?.data) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader title="게시글 수정" onBackPress={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            게시글 정보를 불러올 수 없습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonHeader title="게시글 수정" onBackPress={handleBack} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* 제목 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목 *</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="모임 제목을 입력하세요"
            placeholderTextColor={colors.manatee}
            maxLength={50}
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내용 *</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="모임에 대한 자세한 내용을 입력하세요"
            placeholderTextColor={colors.manatee}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
        </View>

        {/* 날짜 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>날짜 *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}>
            <CalendarOpacityIcon width={20} height={20} />
            <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>
        </View>

        {/* 시간 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시간 *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}>
            <ClockIcon width={20} height={20} />
            <Text style={styles.dateButtonText}>{formatTime(date)}</Text>
          </TouchableOpacity>
        </View>

        {/* 장소 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>장소 *</Text>
          <TouchableOpacity
            style={styles.addressButton}
            onPress={() => setShowAddressModal(true)}>
            <Text style={styles.addressButtonText}>
              {location || '장소를 선택하세요'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 최대 참가자 수 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최대 참가자 수 *</Text>
          <View style={styles.participantsContainer}>
            <TouchableOpacity
              style={[
                styles.participantButton,
                maxParticipants > 1 && styles.participantButtonActive,
              ]}
              onPress={() =>
                setMaxParticipants(Math.max(1, maxParticipants - 1))
              }>
              <Text style={styles.participantButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.participantCount}>{maxParticipants}명</Text>
            <TouchableOpacity
              style={[
                styles.participantButton,
                maxParticipants < 10 && styles.participantButtonActive,
              ]}
              onPress={() =>
                setMaxParticipants(Math.min(10, maxParticipants + 1))
              }>
              <Text style={styles.participantButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isUpdatingPost && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isUpdatingPost}>
          {isUpdatingPost ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>수정 완료</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 날짜 선택 모달 */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* 시간 선택 모달 */}
      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* 주소 선택 모달 */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>장소 선택</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddressModal(false)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
          <Postcode
            style={styles.postcode}
            jsOptions={{animation: false}}
            onSelected={handleAddressSelect}
            onError={(error: any) => {
              console.error('주소 검색 오류:', error);
              setShowAddressModal(false);
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.manatee,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: semanticColors.error,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.richBlack,
    backgroundColor: '#FFFFFF',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.richBlack,
    backgroundColor: '#FFFFFF',
    height: 120,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.richBlack,
  },
  addressButton: {
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  addressButtonText: {
    fontSize: 16,
    color: colors.richBlack,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightSilver,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantButtonActive: {
    backgroundColor: semanticColors.primary,
  },
  participantButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  participantCount: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: colors.richBlack,
  },
  saveButton: {
    backgroundColor: semanticColors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: colors.manatee,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSilver,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.richBlack,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: semanticColors.primary,
  },
  postcode: {
    flex: 1,
  },
});

export default EditGroup;
