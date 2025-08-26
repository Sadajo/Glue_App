import {useState, useEffect} from 'react';
import {
  getVisibilitySettings,
  updateMajorVisibility,
  updateMeetingHistoryVisibility,
  updateLikeListVisibility,
  updateGuestbookVisibility,
} from '../api/profileApi';

export interface VisibilitySettings {
  currentMajorVisibility: number;
  currentMeetingHistoryVisibility: number;
  currentLikeListVisibility: number;
  currentGuestBookVisibility: number;
}

export const usePrivacySettings = () => {
  const [settings, setSettings] = useState<VisibilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 공개 범위 설정 조회
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const data = await getVisibilitySettings();
      setSettings(data);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      console.error('공개 범위 설정 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 학과 공개 설정 업데이트 (낙관적 업데이트)
  const updateMajor = async (visible: boolean) => {
    console.log('updateMajor 호출됨:', visible);
    if (!settings) return;

    const previousValue = settings.currentMajorVisibility;

    try {
      // 낙관적 업데이트: UI 먼저 업데이트
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentMajorVisibility: visible ? 1 : 0,
            }
          : null,
      );
      console.log('상태 업데이트 완료:', visible ? 1 : 0);

      // API 호출
      await updateMajorVisibility(visible ? 1 : 0);
      console.log('API 호출 성공');
    } catch (err) {
      console.error('API 호출 실패:', err);
      // 실패 시 이전 값으로 롤백
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentMajorVisibility: previousValue,
            }
          : null,
      );
      setError(err as Error);
      throw err;
    }
  };

  // 모임 히스토리 공개 설정 업데이트 (낙관적 업데이트)
  const updateMeetingHistory = async (visible: boolean) => {
    if (!settings) return;

    const previousValue = settings.currentMeetingHistoryVisibility;

    try {
      // 낙관적 업데이트: UI 먼저 업데이트
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentMeetingHistoryVisibility: visible ? 1 : 0,
            }
          : null,
      );

      // API 호출
      await updateMeetingHistoryVisibility(visible ? 1 : 0);
    } catch (err) {
      // 실패 시 이전 값으로 롤백
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentMeetingHistoryVisibility: previousValue,
            }
          : null,
      );
      setError(err as Error);
      throw err;
    }
  };

  // 좋아요 목록 공개 설정 업데이트 (낙관적 업데이트)
  const updateLikeList = async (visible: boolean) => {
    if (!settings) return;

    const previousValue = settings.currentLikeListVisibility;

    try {
      // 낙관적 업데이트: UI 먼저 업데이트
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentLikeListVisibility: visible ? 1 : 0,
            }
          : null,
      );

      // API 호출
      await updateLikeListVisibility(visible ? 1 : 0);
    } catch (err) {
      // 실패 시 이전 값으로 롤백
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentLikeListVisibility: previousValue,
            }
          : null,
      );
      setError(err as Error);
      throw err;
    }
  };

  // 방명록 공개 설정 업데이트 (낙관적 업데이트)
  const updateGuestbook = async (visible: boolean) => {
    if (!settings) return;

    const previousValue = settings.currentGuestBookVisibility;

    try {
      // 낙관적 업데이트: UI 먼저 업데이트
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentGuestBookVisibility: visible ? 1 : 0,
            }
          : null,
      );

      // API 호출
      await updateGuestbookVisibility(visible ? 1 : 0);
    } catch (err) {
      // 실패 시 이전 값으로 롤백
      setSettings(prev =>
        prev
          ? {
              ...prev,
              currentGuestBookVisibility: previousValue,
            }
          : null,
      );
      setError(err as Error);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch: fetchSettings,
    updateMajor,
    updateMeetingHistory,
    updateLikeList,
    updateGuestbook,
  };
};
