// 언어 코드를 i18n을 사용해서 텍스트로 변환하는 유틸리티 함수
import {TFunction} from 'i18next';

export const getLanguageText = (languageCode: number, t: TFunction): string => {
  const languageKeys: Record<number, string> = {
    0: 'korean',
    1: 'english',
    2: 'chinese',
    3: 'japanese',
    4: 'spanish',
    5: 'french',
    6: 'german',
  };

  const key = languageKeys[languageCode];
  return key ? t(`profile.languages.${key}`) : t('profile.languages.other');
};

export const getLanguageLevelText = (levelCode: number, t: TFunction): string => {
  const levelKeys: Record<number, string> = {
    0: 'beginner',
    1: 'elementary',
    2: 'intermediate',
    3: 'upperIntermediate',
    4: 'advanced',
    5: 'native',
  };

  const key = levelKeys[levelCode];
  return key ? t(`profile.levels.${key}`) : t('profile.levels.notSet');
};
