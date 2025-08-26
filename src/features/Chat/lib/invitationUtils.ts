/**
 * 초대 메시지 파싱을 위한 유틸리티 함수들
 */

import {InvitationMessage} from '../api/api';

/**
 * 초대 메시지 문자열을 안전하게 파싱하는 함수
 * @param messageContent 메시지 내용
 * @returns 파싱된 초대 메시지 데이터 또는 null
 */
export const parseInvitationMessage = (
  messageContent: string,
): InvitationMessage | null => {
  try {
    // [INVITATION] 접두사가 있는지 확인
    if (!messageContent || !messageContent.startsWith('[INVITATION]')) {
      return null;
    }

    // [INVITATION] 접두사를 제거하고 JSON 부분 추출
    const jsonPart = messageContent.replace('[INVITATION]', '');

    // 빈 문자열 체크
    if (!jsonPart || jsonPart.trim() === '') {
      console.warn('초대 메시지 데이터가 비어있습니다:', messageContent);
      return null;
    }

    // JSON 형식인지 확인 (간단한 검사)
    const trimmedData = jsonPart.trim();
    if (!trimmedData.startsWith('{') || !trimmedData.endsWith('}')) {
      console.warn('초대 메시지가 JSON 형식이 아닙니다:', trimmedData);
      return null;
    }

    // JSON 파싱
    let invitationData;
    try {
      invitationData = JSON.parse(trimmedData);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      console.error('파싱 시도한 문자열:', trimmedData);
      return null;
    }

    // 파싱된 데이터 검증
    if (!invitationData || typeof invitationData !== 'object') {
      console.warn('초대 메시지 데이터가 올바르지 않습니다:', invitationData);
      return null;
    }

    return invitationData as InvitationMessage;
  } catch (error) {
    console.error('초대 메시지 파싱 중 오류 발생:', error);
    console.error('메시지 내용:', messageContent);
    return null;
  }
};

/**
 * 초대 메시지인지 확인하는 함수
 * @param messageContent 메시지 내용
 * @returns 초대 메시지 여부
 */
export const isInvitationMessage = (messageContent: string): boolean => {
  return Boolean(messageContent && messageContent.startsWith('[INVITATION]'));
};

/**
 * 초대 메시지를 사용자에게 친화적인 형태로 변환하는 함수
 * @param messageContent 메시지 내용
 * @param fallbackMessage 파싱 실패 시 기본 메시지
 * @returns 변환된 메시지
 */
export const formatInvitationMessageForDisplay = (
  messageContent: string,
  fallbackMessage: string = '초대 메시지',
): string => {
  const invitationData = parseInvitationMessage(messageContent);

  if (!invitationData) {
    return fallbackMessage;
  }

  const senderName = invitationData.senderName || '호스트';
  const inviteeName = invitationData.inviteeName || '게스트';

  return `${senderName}님이 ${inviteeName}님을 초대했습니다`;
};
