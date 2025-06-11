import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Postcode from '@actbase/react-daum-postcode';
import {colors} from '../../../app/styles/colors';
import {Text} from '../../../shared/ui/typography/Text';
import GroupCreateHeader from './components/GroupCreateHeader';
import {CalendarOpacityIcon, ClockIcon} from '../../../shared/assets/images';
import {useCreateGroupPost, useJoinGroupChatRoom} from '../api/hooks';
import {toastService} from '../../../shared/lib/notifications/toast';

// Daum Postcode 결과 데이터 타입
interface DaumPostcodeResult {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  jibunAddress: string;
  roadAddress: string;
  zonecode: string | number;
  [key: string]: any; // 추가 속성들을 위한 인덱스 시그니처
}

// 라우트 파라미터 타입 정의
interface RouteParams {
  groupType: string;
  myLanguage: string;
  exchangeLanguage: string;
  memberCount: number;
  groupTitle: string;
  groupContent: string;
  imageUrls?: string[];
}

const GroupCreateStep4 = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {t} = useTranslation();
  const params = route.params as RouteParams;
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState<string>('');
  // 현재 시간 + 3시간을 최소 시간으로 설정
  const getMinimumDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 3);
    return now;
  };

  const [date, setDate] = useState<Date>(getMinimumDateTime());
  const [tempDate, setTempDate] = useState<Date>(getMinimumDateTime());
  const [location, setLocation] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

  // API 호출을 위한 훅 사용
  const {mutate: createPost, isPending: isCreatingPost} = useCreateGroupPost();
  const {mutate: joinChatRoom, isPending: isJoiningChat} =
    useJoinGroupChatRoom();

  // 전체 로딩 상태
  const isPending = isCreatingPost || isJoiningChat;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = () => {
    if (title.trim() === '' || location.trim() === '') {
      toastService.error(
        t('common.error'),
        t('group.create.error.required_fields'),
      );
      return;
    }

    // 카테고리 ID 매핑 (예시)
    const getCategoryId = (type: string): number => {
      switch (type) {
        case 'study':
          return 1;
        case 'social':
          return 2;
        case 'help':
          return 3;
        default:
          return 1;
      }
    };

    // 언어 ID 매핑 (예시)
    const getLanguageId = (language: string): number => {
      switch (language) {
        case '한국어':
        case 'Korean':
          return 1;
        case '영어':
        case 'English':
          return 2;
        case '일본어':
        case 'Japanese':
          return 3;
        case '중국어':
        case 'Chinese':
          return 4;
        case '독일어':
        case 'German':
          return 5;
        case '프랑스어':
        case 'French':
          return 6;
        case '스페인어':
        case 'Spanish':
          return 7;
        default:
          return 1;
      }
    };

    // ISO 포맷으로 날짜 변환 (yyyy-MM-dd'T'HH:mm:ss)
    const formattedDate = date.toISOString().split('.')[0];

    // API 요청 데이터 구성
    const requestData = {
      meeting: {
        meetingTitle: title,
        categoryId: getCategoryId(params.groupType),
        meetingPlaceName: location,
        meetingTime: formattedDate,
        mainLanguageId: getLanguageId(params.myLanguage),
        exchangeLanguageId: getLanguageId(params.exchangeLanguage),
        maxParticipants: params.memberCount,
      },
      post: {
        title: params.groupTitle,
        content: params.groupContent,
        imageUrls: params.imageUrls || [],
      },
    };
    console.log('[게시글 생성 API 요청 데이터]', {
      ...requestData,
      imageUrlsCount: requestData.post.imageUrls.length,
      imageUrls: requestData.post.imageUrls,
    });

    // API 호출
    createPost(requestData, {
      onSuccess: response => {
        console.log('모임 게시글 생성 성공:', response.data);

        // 게시글 ID와 모임 ID 추출
        const postId = response.data?.postId;
        const meetingId = response.data?.postId;

        if (postId && meetingId) {
          // 게시글 생성 후 자동으로 그룹 채팅방 참여
          joinChatRoom(meetingId, {
            onSuccess: chatResponse => {
              console.log('그룹 채팅방 참여 성공:', chatResponse.data);

              // 성공 토스트 표시
              toastService.success(
                t('group.create.success.title'),
                '모임이 생성되고 채팅방에 참여되었습니다!',
              );

              // 먼저 메인 화면의 Group 탭으로 이동
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    params: {
                      screen: 'MainTabs',
                      params: {
                        screen: 'Group',
                        params: {
                          screen: 'GroupList',
                        },
                      },
                    },
                  },
                ],
              });

              // 잠시 후 상세 화면으로 이동
              setTimeout(() => {
                navigation.navigate('GroupDetail', {postId});
              }, 100);
            },
            onError: chatError => {
              console.error('그룹 채팅방 참여 실패:', chatError);

              // 채팅방 참여는 실패했지만 게시글은 성공했으므로 부분 성공 메시지
              toastService.success(
                t('group.create.success.title'),
                '모임이 생성되었습니다. (채팅방 참여는 나중에 시도해주세요)',
              );

              // 그래도 상세 화면으로 이동
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    params: {
                      screen: 'MainTabs',
                      params: {
                        screen: 'Group',
                        params: {
                          screen: 'GroupList',
                        },
                      },
                    },
                  },
                ],
              });

              setTimeout(() => {
                navigation.navigate('GroupDetail', {postId});
              }, 100);
            },
          });
        } else {
          // ID를 받지 못한 경우 그룹 목록으로 이동
          toastService.success(
            t('group.create.success.title'),
            t('group.create.success.message'),
          );

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Main',
                params: {
                  screen: 'MainTabs',
                  params: {
                    screen: 'Group',
                    params: {
                      screen: 'GroupList',
                    },
                  },
                },
              },
            ],
          });
        }
      },
      onError: error => {
        console.error('모임 게시글 생성 실패:', error);
        toastService.error(
          t('group.create.error.title'),
          `${t('group.create.error.message')}: ${error.message}`,
        );
      },
    });
  };

  const openDatePicker = () => {
    setTempDate(date);
    if (Platform.OS === 'ios') {
      setShowDatePicker(true);
    } else {
      // Android에서는 바로 DateTimePicker 표시
      setShowDatePicker(true);
    }
  };

  const openTimePicker = () => {
    setTempDate(date);
    if (Platform.OS === 'ios') {
      setShowTimePicker(true);
    } else {
      // Android에서는 바로 DateTimePicker 표시
      setShowTimePicker(true);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        const minimumDateTime = getMinimumDateTime();
        // 선택한 날짜가 최소 시간보다 이후인지 확인
        if (selectedDate >= minimumDateTime) {
          setDate(selectedDate);
        } else {
          // 최소 시간보다 이전인 경우 토스트 메시지 표시
          toastService.error(
            t('common.error'),
            '모임 시간은 현재 시간으로부터 3시간 이후로 설정해주세요.',
          );
        }
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && selectedTime) {
        const minimumDateTime = getMinimumDateTime();
        // 선택한 시간이 최소 시간보다 이후인지 확인
        if (selectedTime >= minimumDateTime) {
          setDate(selectedTime);
        } else {
          // 최소 시간보다 이전인 경우 토스트 메시지 표시
          toastService.error(
            t('common.error'),
            '모임 시간은 현재 시간으로부터 3시간 이후로 설정해주세요.',
          );
        }
      }
    } else {
      if (selectedTime) {
        setTempDate(selectedTime);
      }
    }
  };

  const confirmDate = () => {
    const minimumDateTime = getMinimumDateTime();
    // 선택한 날짜가 최소 시간보다 이후인지 확인
    if (tempDate >= minimumDateTime) {
      setDate(tempDate);
      setShowDatePicker(false);
    } else {
      // 최소 시간보다 이전인 경우 토스트 메시지 표시
      toastService.error(
        t('common.error'),
        '모임 시간은 현재 시간으로부터 3시간 이후로 설정해주세요.',
      );
    }
  };

  const confirmTime = () => {
    const minimumDateTime = getMinimumDateTime();
    // 선택한 시간이 최소 시간보다 이후인지 확인
    if (tempDate >= minimumDateTime) {
      setDate(tempDate);
      setShowTimePicker(false);
    } else {
      // 최소 시간보다 이전인 경우 토스트 메시지 표시
      toastService.error(
        t('common.error'),
        '모임 시간은 현재 시간으로부터 3시간 이후로 설정해주세요.',
      );
    }
  };

  const handleAddressSelect = (data: DaumPostcodeResult) => {
    // 도로명 주소 또는 지번 주소 중 하나를 선택
    const fullAddress = data.roadAddress || data.jibunAddress;

    // 건물명이 있으면 추가
    const buildingName = data.buildingName ? ` (${data.buildingName})` : '';

    // 최종 주소 설정
    setLocation(`${fullAddress}${buildingName}`);

    // 실제 구현에서는 주소를 좌표로 변환하는 API를 호출해야 합니다.
    // 예시로 좌표값을 설정 (실제로는 Geocoding API 등을 사용해야 함)
    // _setCoordinates({
    //   latitude: 위도값,
    //   longitude: 경도값,
    // });

    setShowAddressModal(false);
  };

  const handleAddressError = (error: unknown) => {
    console.error('Postcode error:', error);
    setShowAddressModal(false);
  };

  const formatDate = (dateValue: Date): string => {
    return dateValue.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  };

  const formatTime = (dateValue: Date): string => {
    const hours = dateValue.getHours();
    const minutes = dateValue.getMinutes();
    const currentLanguage = t('signup.language.title').includes('한국어')
      ? 'ko'
      : 'en';

    if (currentLanguage === 'ko') {
      const ampm = hours >= 12 ? '오후' : '오전';
      const hour12 = hours % 12 || 12;
      return `${ampm} ${hour12 < 10 ? '0' + hour12 : hour12}:${
        minutes < 10 ? '0' + minutes : minutes
      }`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12 < 10 ? '0' + hour12 : hour12}:${
        minutes < 10 ? '0' + minutes : minutes
      } ${ampm}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GroupCreateHeader title={t('group.create.title')} onBack={handleBack} />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.stepText}>
          {t('group.create.step', {step: 4, total: 4})}
        </Text>

        <Text style={styles.titleText}>{t('group.create.step4.title')}</Text>

        {/* 모임 제목 입력 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t('group.create.step4.group_title')}
          </Text>
          <TextInput
            placeholder={t('group.create.step4.group_title_placeholder')}
            placeholderTextColor={colors.manatee}
            value={title}
            onChangeText={setTitle}
            style={styles.textInput}
          />
        </View>

        {/* 모임 일시 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t('group.create.step4.meeting_datetime')}
          </Text>
          <View style={styles.dateTimeRow}>
            {/* 날짜 선택 */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={openDatePicker}>
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
              <CalendarOpacityIcon style={styles.dateTimeIcon} />
            </TouchableOpacity>

            {/* 시간 선택 */}
            <TouchableOpacity
              style={styles.timeButton}
              onPress={openTimePicker}>
              <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
              <ClockIcon style={styles.dateTimeIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 장소 입력 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t('group.create.step4.meeting_location')}
          </Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowAddressModal(true)}>
            <Text
              style={[
                styles.locationText,
                !location && styles.placeholderText,
              ]}>
              {location || t('group.create.step4.meeting_location_placeholder')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, Platform.OS === 'android' && {paddingBottom: insets.bottom + 20}]}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            title.trim() !== '' && location.trim() !== ''
              ? styles.activeButton
              : styles.inactiveButton,
          ]}
          disabled={title.trim() === '' || location.trim() === '' || isPending}
          onPress={handleComplete}>
          <Text style={styles.completeButtonText}>
            {t('group.create.step4.complete')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 전체 화면 로딩 인디케이터 */}
      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.batteryChargedBlue} />
          <Text style={styles.loadingText}>
            {isCreatingPost
              ? '모임을 생성하고 있습니다...'
              : isJoiningChat
              ? '채팅방에 참여하고 있습니다...'
              : t('common.loading')}
          </Text>
        </View>
      )}

      {/* 날짜 선택 모달 */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {t('group.create.step4.select_date')}
              </Text>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={getMinimumDateTime()}
                style={styles.datePicker}
                textColor={colors.charcoal}
                accentColor={colors.batteryChargedBlue}
                themeVariant="light"
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancelButtonText}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={confirmDate}>
                  <Text style={styles.modalConfirmButtonText}>
                    {t('common.ok')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 시간 선택 모달 */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          visible={showTimePicker}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {t('group.create.step4.select_time')}
              </Text>

              <DateTimePicker
                value={tempDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                minimumDate={getMinimumDateTime()}
                style={styles.datePicker}
                textColor={colors.charcoal}
                accentColor={colors.batteryChargedBlue}
                themeVariant="light"
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalCancelButtonText}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={confirmTime}>
                  <Text style={styles.modalConfirmButtonText}>
                    {t('common.ok')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android용 DateTimePicker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={getMinimumDateTime()}
          textColor={colors.charcoal}
          accentColor={colors.batteryChargedBlue}
          themeVariant="light"
        />
      )}

      {/* Android용 TimePicker */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
          minimumDate={getMinimumDateTime()}
          textColor={colors.charcoal}
          accentColor={colors.batteryChargedBlue}
          themeVariant="light"
        />
      )}

      {/* 주소 검색 모달 */}
      <Modal
        transparent={true}
        visible={showAddressModal}
        animationType="fade"
        onRequestClose={() => setShowAddressModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.addressModalContainer}>
            <View style={styles.addressModalHeader}>
              <Text style={styles.modalTitle}>
                {t('group.create.step4.meeting_location')}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddressModal(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Postcode
              style={styles.postcodeStyle}
              jsOptions={{animation: true, hideMapBtn: true}}
              onSelected={handleAddressSelect}
              onError={handleAddressError}
            />
          </View>
        </View>
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
  inputContainer: {
    marginBottom: 24,
    paddingHorizontal: 19,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.charcoal,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.charcoal,
  },
  placeholderText: {
    color: colors.manatee,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateTimeText: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: 'normal',
  },
  dateTimeIcon: {
    width: 22,
    height: 22,
  },
  bottomContainer: {
    paddingHorizontal: 19,
    paddingBottom: 20,
  },
  completeButton: {
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
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 로딩 오버레이 스타일
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkCharcoal,
  },
  // 모달 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addressModalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSilver,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.charcoal,
  },
  postcodeStyle: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    color: colors.darkCharcoal,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  datePicker: {
    width: Platform.OS === 'ios' ? 300 : '100%',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightSilver,
    borderRadius: 8,
    marginRight: 8,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.batteryChargedBlue,
    borderRadius: 8,
  },
  modalCancelButtonText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalConfirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupCreateStep4;
