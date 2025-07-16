/**
 * UTC 시간을 한국시간(UTC+9)로 변환하는 유틸리티 함수들
 */

/**
 * UTC 시간 문자열을 한국시간 Date 객체로 변환
 * @param utcTimeString - UTC 시간 문자열 (예: "2024-01-01T12:00:00")
 * @returns 한국시간으로 변환된 Date 객체
 */
export const convertUTCToKST = (utcTimeString: string | null): Date | null => {
  if (!utcTimeString) return null;

  try {
    const utcDate = new Date(utcTimeString);
    if (isNaN(utcDate.getTime())) return null;

    // UTC 시간에 9시간 추가하여 한국시간으로 변환
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    return kstDate;
  } catch (error) {
    console.error('UTC to KST 변환 실패:', error);
    return null;
  }
};

/**
 * UTC 시간 문자열을 한국시간 기준으로 포맷팅
 * @param utcTimeString - UTC 시간 문자열
 * @returns 포맷팅된 한국시간 문자열
 */
export const formatKSTTime = (utcTimeString: string | null): string => {
  if (!utcTimeString) return '';

  const kstDate = convertUTCToKST(utcTimeString);
  if (!kstDate) return '';

  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  // 같은 날인지 확인 (한국시간 기준)
  const isToday = kstNow.toDateString() === kstDate.toDateString();

  if (isToday) {
    // 오늘이면 시간만 표시 (오전/오후 형식)
    return kstDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    // 다른 날이면 날짜 표시
    return kstDate.toLocaleDateString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
    });
  }
};

/**
 * 채팅 메시지용 상세 시간 포맷팅 (한국시간)
 * @param utcTimeString - UTC 시간 문자열
 * @returns 상세 시간 문자열 (예: "2024년 1월 1일 오후 9:00")
 */
export const formatDetailedKSTTime = (utcTimeString: string | null): string => {
  if (!utcTimeString) return '';

  const kstDate = convertUTCToKST(utcTimeString);
  if (!kstDate) return '';

  return kstDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * 날짜 구분선용 포맷팅 (한국시간)
 * @param utcTimeString - UTC 시간 문자열
 * @returns 날짜 구분선 문자열 (예: "2024년 1월 1일")
 */
export const formatKSTDate = (utcTimeString: string | null): string => {
  if (!utcTimeString) return '';

  const kstDate = convertUTCToKST(utcTimeString);
  if (!kstDate) return '';

  return kstDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 메시지 시간 표시용 간단한 포맷팅 (한국시간)
 * @param utcTimeString - UTC 시간 문자열
 * @returns 간단한 시간 문자열 (예: "오후 9:00")
 */
export const formatSimpleKSTTime = (utcTimeString: string | null): string => {
  if (!utcTimeString) return '';

  const kstDate = convertUTCToKST(utcTimeString);
  if (!kstDate) return '';

  return kstDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * 두 UTC 시간이 같은 날인지 확인 (한국시간 기준)
 * @param utcTime1 - 첫 번째 UTC 시간 문자열
 * @param utcTime2 - 두 번째 UTC 시간 문자열
 * @returns 같은 날이면 true, 다르면 false
 */
export const isSameKSTDate = (
  utcTime1: string | null,
  utcTime2: string | null,
): boolean => {
  if (!utcTime1 || !utcTime2) return false;

  const kstDate1 = convertUTCToKST(utcTime1);
  const kstDate2 = convertUTCToKST(utcTime2);

  if (!kstDate1 || !kstDate2) return false;

  return kstDate1.toDateString() === kstDate2.toDateString();
};
