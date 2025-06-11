import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';

import {LanguageCard} from './components/LanguageCard';
import {MyInfoItem} from './components/MyInfoItem';
import {styles} from './styles/MyPageScreen.styles';
import {useMyPage} from '../model/useMyPage';
import {getLanguageText, getLanguageLevelText} from '../model/utils';
import {RightArrowIcon} from '@shared/assets/images';
import CustomHeader from '@widgets/header/ui/CustomHeader';
import {secureStorage} from '@shared/lib/security';

// 스켈레톤 컴포넌트들
const SkeletonProfileCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [opacity]);

  return (
    <Animated.View style={[styles.profileRow, {opacity}]}>
      <View style={[styles.avatar, styles.skeletonElement]} />
      <View style={styles.infoContainer}>
        <View
          style={[
            styles.skeletonText,
            {width: '60%', height: 20, marginBottom: 8},
          ]}
        />
        <View style={[styles.skeletonText, {width: '80%', height: 16}]} />
      </View>
      <View style={[styles.skeletonText, {width: 24, height: 24}]} />
    </Animated.View>
  );
};

const SkeletonLanguageCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [opacity]);

  return (
    <Animated.View style={[{opacity, marginBottom: 12}]}>
      <View
        style={[
          styles.skeletonText,
          {width: '40%', height: 16, marginBottom: 8},
        ]}
      />
      <View
        style={[
          styles.skeletonText,
          {width: '60%', height: 14, marginBottom: 4},
        ]}
      />
      <View style={[styles.skeletonText, {width: '50%', height: 14}]} />
    </Animated.View>
  );
};

const SkeletonInfoItem = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [opacity]);

  return (
    <Animated.View
      style={[{opacity, paddingVertical: 16, paddingHorizontal: 20}]}>
      <View style={[styles.skeletonText, {width: '70%', height: 18}]} />
    </Animated.View>
  );
};

export const MyPageScreen = () => {
  const navigation = useNavigation<any>();
  const {myPageInfo, isLoading, isError, error, refetch} = useMyPage();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const {t} = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userId = await secureStorage.getUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error('사용자 ID 가져오기 실패:', error);
      }
    };
    getCurrentUserId();
  }, []);

  // 화면에 포커스될 때마다 프로필 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // 데이터 로딩 완료 시 페이드인 애니메이션
  useEffect(() => {
    if (!isLoading && myPageInfo) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isLoading) {
      fadeAnim.setValue(0);
    }
  }, [isLoading, myPageInfo, fadeAnim]);

  // 기본 프로필 이미지
  const defaultAvatar = require('@shared/assets/images/logo.png');

  // 내 방명록으로 이동
  const handleGuestbookPress = () => {
    if (currentUserId && myPageInfo?.userNickname) {
      navigation.navigate('Guestbook', {
        userId: currentUserId,
        userNickname: myPageInfo.userNickname,
      });
    }
  };

  // 로딩 상태 - 스켈레톤 표시
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader />
        <ScrollView contentContainerStyle={styles.content}>
          {/* 프로필 섹션 스켈레톤 */}
          <SkeletonProfileCard />

          {/* 언어 설정 섹션 스켈레톤 */}
          <View
            style={[
              styles.skeletonText,
              {width: '50%', height: 20, marginTop: 32, marginBottom: 16},
            ]}
          />
          <View style={styles.languageContainer}>
            <SkeletonLanguageCard />
            <SkeletonLanguageCard />
          </View>

          {/* 내 정보 리스트 섹션 스켈레톤 */}
          <View
            style={[
              styles.skeletonText,
              {width: '40%', height: 20, marginTop: 32, marginBottom: 16},
            ]}
          />
          <View style={styles.infoList}>
            {Array.from({length: 5}).map((_, index) => (
              <SkeletonInfoItem key={index} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader />
        <View
          style={[
            styles.content,
            {justifyContent: 'center', alignItems: 'center'},
          ]}>
          <Text style={{color: 'red', textAlign: 'center'}}>
            {error?.message || t('profile.loadError')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader />
      <Animated.View style={{flex: 1, opacity: fadeAnim}}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* ── 프로필 섹션 (실제 API 데이터) ── */}
          <TouchableOpacity
            style={styles.profileRow}
            onPress={() => navigation.navigate('ProfileEdit')}>
            <Image
              source={
                myPageInfo?.profileImageUrl
                  ? {uri: myPageInfo.profileImageUrl}
                  : defaultAvatar
              }
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.nickname}>
                {myPageInfo?.userNickname || t('profile.defaultUser')}
              </Text>
              <Text style={styles.bio}>
                {myPageInfo?.description || t('profile.defaultBio')}
              </Text>
            </View>

            {/* 오른쪽 화살표 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfileEdit')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <RightArrowIcon width={24} height={24} />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* 언어 설정 */}
          <Text style={styles.sectionTitle}>
            {t('profile.languageSettings')}
          </Text>
          <View style={styles.languageContainer}>
            <LanguageCard
              title={t('profile.myLanguage')}
              language={
                myPageInfo
                  ? getLanguageText(myPageInfo.mainLanguage, t)
                  : t('profile.notSet')
              }
              level={
                myPageInfo
                  ? getLanguageLevelText(myPageInfo.mainLanguageLevel, t)
                  : t('profile.notSet')
              }
              onEdit={() => navigation.navigate('ProfileEdit')}
            />
            <LanguageCard
              title={t('profile.exchangeLanguage')}
              language={
                myPageInfo
                  ? getLanguageText(myPageInfo.learningLanguage, t)
                  : t('profile.notSet')
              }
              level={
                myPageInfo
                  ? getLanguageLevelText(myPageInfo.learningLanguageLevel, t)
                  : t('profile.notSet')
              }
              onEdit={() => navigation.navigate('ProfileEdit')}
            />
          </View>

          {/* 내 정보 리스트 */}
          <Text style={styles.sectionTitle}>{t('profile.myInfo')}</Text>
          <View style={styles.infoList}>
            <MyInfoItem
              label={t('profile.myGroupsHistory')}
              onPress={() => navigation.navigate('GroupHistory')}
            />
            <MyInfoItem
              label={t('profile.myParticipatingGroups')}
              onPress={() => navigation.navigate('MyParticipatingMeetings')}
            />
            <MyInfoItem
              label={t('profile.myLikes')}
              onPress={() => navigation.navigate('LikedGroups')}
            />
            <MyInfoItem
              label={t('profile.myGuestbook')}
              onPress={handleGuestbookPress}
            />
            <MyInfoItem
              label={t('profile.privacySettings')}
              onPress={() => navigation.navigate('PrivacySettings')}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};
