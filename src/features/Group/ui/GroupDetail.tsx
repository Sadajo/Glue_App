import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {GroupDetailProps} from '../model/types';
import {commonStyles, navigationStyles} from './styles/groupStyles';
import {groupDetailStyles} from './styles/groupDetailStyles';
import GroupHeader from './components/GroupHeader';
import GroupAuthorInfo from './components/GroupAuthorInfo';
import GroupInfo from './components/GroupInfo';
import GroupLikes from './components/GroupLikes';
import {Button} from '@shared/ui';
import {Text} from '@shared/ui/typography';
import {toastService} from '../../../shared/lib/notifications/toast';
import {useGroupDetail, useCreateDmChatRoom, useReport} from '../api/hooks';
import {useTranslation} from 'react-i18next';
import {secureStorage} from '@shared/lib/security';
import ReportModal from './components/ReportModal';

/**
 * 모임 상세 화면 컴포넌트
 */
const GroupDetail: React.FC<GroupDetailProps> = ({route, navigation}) => {
  const {t} = useTranslation();
  const {postId} = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMyPost, setIsMyPost] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  // 모임 상세 정보 조회 훅 사용
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGroupDetail(Number(postId));

  // DM 채팅방 생성 훅 사용
  const {mutate: createDmChatRoomMutate} = useCreateDmChatRoom();

  // 신고 훅 사용
  const {mutate: reportMutate} = useReport();

  // 작성자 프로필로 이동하는 핸들러
  const handleAuthorPress = (userId: number) => {
    console.log('사용자 프로필로 이동:', userId);
    navigation.navigate('UserProfile', {userId});
  };

  // 내가 작성한 글인지 확인
  useEffect(() => {
    const checkIsMyPost = async () => {
      try {
        if (response?.data?.meeting?.creator) {
          const userId = await secureStorage.getUserId();
          const creatorId = response.data.meeting.creator.userId;

          setCurrentUserId(userId);
          if (userId && creatorId === userId) {
            console.log('내가 작성한 게시글입니다.');
            setIsMyPost(true);
          } else {
            console.log('내가 작성한 게시글이 아닙니다.');
            setIsMyPost(false);
          }
        }
      } catch (error) {
        console.error('사용자 정보 확인 오류:', error);
      }
    };

    if (response?.data) {
      checkIsMyPost();
    }
  }, [response]);

  // 카테고리 ID에서 텍스트로 변환
  const getCategoryTextFromId = (categoryId: number): string => {
    switch (categoryId) {
      case 1:
        return t('group.categories.study');
      case 2:
        return t('group.categories.social');
      case 3:
        return t('group.categories.help');
      default:
        return '';
    }
  };

  // 카테고리 ID에서 배경색으로 변환
  const getCategoryColorFromId = (categoryId: number): string => {
    switch (categoryId) {
      case 1: // 공부
        return '#DEE9FC';
      case 2: // 친목
        return '#E1FBE8';
      case 3: // 도움
        return '#FFF1BB';
      default:
        return '#DEE9FC'; // 기본 배경색
    }
  };

  // 카테고리 ID에서 텍스트 색상으로 변환
  const getCategoryTextColorFromId = (categoryId: number): string => {
    switch (categoryId) {
      case 1:
        return '#263FA9';
      case 2:
        return '#306339';
      case 3:
        return '#A47C5E';
      default:
        return '#263FA9'; // 기본 텍스트 색상
    }
  };

  // DM 채팅방 생성 버튼 클릭 핸들러
  const handleSendDmPress = async () => {
    if (!response?.data?.meeting || !currentUserId) return;

    try {
      setIsSubmitting(true);

      // 내 아이디와 작성자 아이디를 userIds 배열에 포함
      const creatorId = response.data.meeting.creator?.userId;
      if (!creatorId || !response.data.meeting.meetingId) {
        console.error('필수 정보가 누락되었습니다.');
        return;
      }
      const userIds = [currentUserId, creatorId];

      createDmChatRoomMutate(
        {
          meetingId: response.data.meeting.meetingId,
          userIds: userIds,
        },
        {
          onSuccess: response => {
            console.log('DM 채팅방 생성 성공:', response.data);

            // 채팅방 ID를 이용해 채팅방 화면으로 이동
            const dmChatRoomId = response.data.detail.dmChatRoomId;
            navigation.navigate('ChatRoom', {dmChatRoomId});

            toastService.success(
              t('common.success'),
              '채팅방이 생성되었습니다.',
            );
          },
          onError: (err: any) => {
            console.error('DM 채팅방 생성 실패:', err.message);
            toastService.error(
              t('common.error'),
              err.message || 'DM 채팅방 생성에 실패했습니다.',
            );
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        },
      );
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('DM 채팅방 생성 오류:', err);
      toastService.error(t('common.error'), 'DM 채팅방 생성에 실패했습니다.');
    }
  };

  // 신고하기 모달 열기 핸들러
  const handleReportPress = () => {
    setReportModalVisible(true);
  };

  // 신고하기 핸들러
  const handleReport = (reasonId: number) => {
    if (!postId) return;

    reportMutate(
      {
        reportedId: Number(postId),
        reasonId: reasonId,
      },
      {
        onSuccess: (response) => {
          console.log('게시글 신고 성공:', response);
          toastService.success(
            t('group.detail.menu.reportModal.success'),
            '신고가 정상적으로 접수되었습니다. 검토 후 조치하겠습니다.',
          );
        },
        onError: (error: any) => {
          console.error('게시글 신고 실패:', error.message);
          // 구체적인 에러 메시지 제공
          let errorMessage = t('group.detail.menu.reportModal.error');
          if (error.message.includes('이미 신고한')) {
            errorMessage = '이미 신고한 게시글입니다.';
          } else if (error.message.includes('권한이 없습니다')) {
            errorMessage = '신고할 권한이 없습니다.';
          } else if (error.message.includes('존재하지 않는')) {
            errorMessage = '존재하지 않는 게시글입니다.';
          }
          
          toastService.error(
            '신고 실패',
            errorMessage,
          );
        },
      },
    );
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <GroupHeader />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#384050" />
        </View>
      </SafeAreaView>
    );
  }

  // 에러 표시
  if (isError || !response?.data) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <GroupHeader />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <Text variant="body1" color="#e74c3c" align="center">
            {error?.message || t('group.detail.loadError')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 데이터에서 필요한 정보 추출
  const {meeting, post} = response.data;
  const creator = meeting.creator;
  const mainImageUrl =
    post.postImageUrl && post.postImageUrl.length > 0 ? post.postImageUrl[0].imageUrl : null;

  // 카테고리 ID가 있으면 번역된 텍스트로 변환
  const categoryText = meeting.categoryId
    ? getCategoryTextFromId(meeting.categoryId)
    : '';

  // 카테고리 ID가 있으면 배경색과 텍스트 색상 계산
  const categoryBgColor = meeting.categoryId
    ? getCategoryColorFromId(meeting.categoryId)
    : '#DEE9FC';

  const categoryTextColor = meeting.categoryId
    ? getCategoryTextColorFromId(meeting.categoryId)
    : '#263FA9';

  return (
    <SafeAreaView style={commonStyles.container}>
      <GroupHeader
        creatorId={creator?.userId || 0}
        postId={post.postId}
        onReportPress={handleReportPress}
      />
      <ScrollView style={[commonStyles.container, {paddingHorizontal: 19}]}>
        {/* 작성자 정보 */}
        <GroupAuthorInfo
          category={categoryText}
          authorName={creator?.userNickname || ''}
          date={meeting.createdAt || ''}
          viewCounts={post.viewCount || 0}
          avatarUrl={creator?.profileImageUrl || null}
          userId={creator?.userId || 0}
          onAuthorPress={handleAuthorPress}
          categoryBgColor={categoryBgColor}
          categoryTextColor={categoryTextColor}
        />

        {/* 제목 및 내용 */}
        <Text variant="h4" weight="bold" style={groupDetailStyles.title}>
          {post.title}
        </Text>
        <Text variant="body1" style={groupDetailStyles.content}>
          {post.content}
        </Text>

        {/* 이미지 */}
        {mainImageUrl && (
          <Image
            source={{uri: mainImageUrl}}
            resizeMode={'stretch'}
            style={groupDetailStyles.contentImage}
          />
        )}

        {/* 모임 정보 */}
        <GroupInfo
          capacity={meeting.maxParticipants}
          currentParticipants={meeting.currentParticipants || 0}
          language={meeting.languageId || meeting.mainLanguageId}
          minForeigners={0} // TODO: 백엔드 API에 추가 필요
          meetingDate={meeting.meetingTime}
          participants={meeting.participants || []}
          onParticipantPress={handleAuthorPress}
        />

        {/* 좋아요 정보 */}
        <GroupLikes 
          likeCount={post.likeCount} 
          postId={post.postId} 
          isLiked={post.isLiked}
        />

        {/* 하단 버튼 영역 */}
        {!isMyPost && (
          <Button
            label={t('group.detail.joinGroup')}
            onPress={handleSendDmPress}
            style={navigationStyles.joinButton}
            textStyle={navigationStyles.joinButtonText}
            disabled={isSubmitting}
          />
        )}
      </ScrollView>
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onReport={handleReport}
      />
    </SafeAreaView>
  );
};

export default GroupDetail;
