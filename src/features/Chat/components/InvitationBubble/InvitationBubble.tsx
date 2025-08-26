import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
// import {styles, receivedStyles} from './styles'; // 더 이상 사용하지 않음
import {InvitationMessage, InvitationStatus} from '../../api/api';
import {
  useAcceptInvitation,
  useGetInvitationStatus,
  useJoinGroupChatRoom,
} from '../../api/hooks';
import {toastService} from '@shared/lib/notifications/toast';
import {dummyProfile} from '@shared/assets/images';
import {useTranslation} from 'react-i18next';

interface InvitationBubbleProps {
  invitationData: InvitationMessage;
  isCurrentUser: boolean;
  currentUserId: number;
  sender: {
    name: string;
    profileImage?: string;
  };
}

const InvitationBubble: React.FC<InvitationBubbleProps> = ({
  invitationData,
  isCurrentUser,
  currentUserId,
  sender,
}) => {
  const {t} = useTranslation();
  const acceptInvitationMutation = useAcceptInvitation();
  const joinGroupChatRoomMutation = useJoinGroupChatRoom();

  // 실시간으로 초대장 상태 조회 (데이터가 없으면 빈 문자열로 처리)
  const {data: statusData, isLoading: isLoadingStatus} = useGetInvitationStatus(
    invitationData?.code || '',
    Boolean(invitationData?.code), // 코드가 있을 때만 활성화
  );

  // 초대 데이터 검증 (Hook 호출 후)
  if (!invitationData || typeof invitationData !== 'object') {
    console.error('InvitationBubble: 잘못된 초대 데이터:', invitationData);
    return (
      <View style={{padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8}}>
        <Text style={{color: '#666', textAlign: 'center'}}>
          초대 메시지를 불러올 수 없습니다.
        </Text>
      </View>
    );
  }

  // 최신 상태 데이터 사용 (API에서 조회한 데이터 우선, 없으면 메시지 데이터 사용)
  const currentStatus = statusData?.data || invitationData;
  const currentUsedCount =
    statusData?.data?.usedCount ?? invitationData.usedCount ?? 0;

  // 디버깅을 위한 로그
  console.log('🎯 InvitationBubble Debug:', {
    currentUserId,
    isCurrentUser,
    isLoadingStatus,
    originalData: {
      usedCount: invitationData.usedCount,
      status: invitationData.status,
    },
    currentData: {
      usedCount: currentUsedCount,
      status: currentStatus.status,
      fromAPI: !!statusData?.data,
    },
    invitationData: {
      inviteeId: invitationData.inviteeId,
      code: invitationData.code,
      senderName: invitationData.senderName,
      inviteeName: invitationData.inviteeName,
      expiresAt: invitationData.expiresAt,
    },
  });

  // 만료 시간 체크 - 서버에서 반환하는 status로 판단 (서버 시간 기준)
  const isExpired = currentStatus.status === InvitationStatus.EXPIRED;

  // 현재 사용자가 초대받은 사람인지 확인
  // DM 채팅방에서는 호스트가 아닌 사용자가 초대받은 사용자
  // 우선 호스트가 아닌 사용자라면 수락 가능하게 설정
  const isInvitee = !isCurrentUser;

  // 수락 여부를 최신 usedCount로 판단
  const isAccepted = currentUsedCount > 0;

  console.log('🎯 InvitationBubble Conditions:', {
    isExpired,
    isInvitee,
    isAccepted,
    currentUsedCount,
    isLoadingStatus,
    statusMatch: currentStatus.status === InvitationStatus.PENDING,
  });

  // 초대 상태에 따른 텍스트 및 색상
  const getStatusInfo = () => {
    if (isExpired) {
      return {
        statusText: t('invitation.status.expired'),
        statusColor: '#888888',
        canAccept: false,
      };
    }

    // usedCount를 기준으로 수락 여부 판단
    if (isAccepted) {
      return {
        statusText: t('invitation.status.accepted'),
        statusColor: '#34C759',
        canAccept: false,
      };
    } else {
      return {
        statusText: t('invitation.status.pending'),
        statusColor: '#FF9500',
        canAccept: isInvitee,
      };
    }
  };

  const statusInfo = getStatusInfo();

  console.log('🎯 StatusInfo Result:', statusInfo);

  const handleAcceptInvitation = async () => {
    if (!statusInfo.canAccept) return;

    try {
      // 1단계: 초대 수락
      const acceptResult = await acceptInvitationMutation.mutateAsync({
        code: invitationData.code,
      });

      console.log('✅ 초대 수락 완료:', acceptResult);

      // 2단계: 그룹 채팅방 참여 (meetingId를 받아서)
      if (acceptResult.data?.meetingId) {
        console.log('🚀 그룹 채팅방 참여 시작:', acceptResult.data.meetingId);

        await joinGroupChatRoomMutation.mutateAsync({
          meetingId: acceptResult.data.meetingId,
        });

        console.log('✅ 그룹 채팅방 참여 완료');
        toastService.success(
          t('common.success'),
          t('invitation.acceptSuccess'),
        );
      } else {
        console.log('✅ 초대 수락만 완료 (meetingId 없음)');
        toastService.success(
          t('common.success'),
          t('invitation.acceptSuccess'),
        );
      }

      // 수락 후 상태 다시 조회 (React Query가 자동으로 처리하지만 수동으로도 가능)
      // refetch는 자동으로 1분마다 실행되고 있음
    } catch (error) {
      console.error('초대 수락/그룹 채팅방 참여 실패:', error);
      toastService.error(t('common.error'), t('invitation.acceptError'));
    }
  };

  // 만료 시간까지 남은 시간 계산 (서버 시간 기준이 아니므로 참고용)
  const getTimeUntilExpiry = () => {
    // 서버에서 이미 만료됨으로 표시된 경우
    if (isExpired) return t('invitation.expired');

    // 클라이언트 시간 기준 계산 (정확하지 않을 수 있음)
    const now = new Date();
    const expiry = new Date(invitationData.expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return t('invitation.timeExpiredLocal');

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `약 ${hours}${t('time.hour')} ${minutes}${t('time.minute')}`;
    } else {
      return `약 ${minutes}${t('time.minute')}`;
    }
  };

  return (
    <View style={{marginVertical: 8, marginHorizontal: 16}}>
      {/* 프로필 이미지와 이름 (다른 채팅 메시지와 동일한 레이아웃) */}
      <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
        {/* 프로필 이미지 */}
        <Image
          source={
            sender.profileImage && sender.profileImage.trim() !== ''
              ? {uri: sender.profileImage}
              : dummyProfile
          }
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            marginRight: 8,
          }}
          resizeMode="cover"
        />

        {/* 메시지 영역 */}
        <View style={{flex: 1}}>
          {/* 발신자 이름 */}
          <Text
            style={{
              fontSize: 12,
              color: '#666',
              marginBottom: 4,
              marginLeft: 4,
            }}>
            {sender.name} {t('invitation.senderLabel', {defaultValue: '👑'})}
          </Text>

          {/* 초대장 카드 */}
          <View
            style={{
              backgroundColor: '#F8F9FA',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              maxWidth: '85%',
            }}>
            {/* 상태 배지 */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}>
              <View
                style={{
                  backgroundColor: statusInfo.statusColor,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                  {statusInfo.statusText}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: '#9CA3AF',
                }}>
                {getTimeUntilExpiry()}
              </Text>
            </View>

            {/* 초대 메시지 */}
            <Text
              style={{
                fontSize: 14,
                color: '#111827',
                lineHeight: 20,
                marginBottom: 16,
              }}>
              {t('invitation.inviteMessage', {senderName: sender.name})}
            </Text>

            {/* 수락 버튼 */}
            {statusInfo.canAccept && !isExpired && (
              <TouchableOpacity
                style={{
                  backgroundColor: isExpired ? '#D1D5DB' : '#1CBFDC',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                onPress={handleAcceptInvitation}
                disabled={
                  isExpired ||
                  acceptInvitationMutation.isPending ||
                  joinGroupChatRoomMutation.isPending
                }>
                <Text
                  style={{
                    color: isExpired ? '#9CA3AF' : 'white',
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                  {acceptInvitationMutation.isPending
                    ? t('invitation.accepting')
                    : joinGroupChatRoomMutation.isPending
                    ? t('invitation.joiningChat')
                    : isExpired
                    ? t('invitation.expired')
                    : t('invitation.acceptInvitation')}
                </Text>
              </TouchableOpacity>
            )}

            {/* 만료된 경우 비활성화된 버튼 */}
            {isExpired && (
              <View
                style={{
                  backgroundColor: '#F3F4F6',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}>
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                  {t('invitation.expired')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default InvitationBubble;
