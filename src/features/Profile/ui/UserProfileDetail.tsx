import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Text} from '@shared/ui/typography';
import {userProfileDetailStyles} from '@features/Profile/ui/styles/userProfileDetailStyles';
import {
  ChevronLeft,
  dummyProfile,
  UserIcon,
  SchoolIcon,
} from '@shared/assets/images';
import {useUserProfile} from '../model/useUserProfile';
import {getLanguageText, getLanguageLevelText} from '../model/utils';
import {useTranslation} from 'react-i18next';

interface UserProfileDetailProps {
  route: {
    params: {
      userId: number;
    };
  };
  navigation: any;
}

const UserProfileDetail: React.FC<UserProfileDetailProps> = ({
  route,
  navigation,
}) => {
  const {userId} = route.params;
  const {t} = useTranslation();
  const {userProfile, isLoading, isError, error} = useUserProfile(userId);

  const renderProfileImage = () => {
    if (userProfile?.profileImageUrl) {
      return (
        <Image
          source={{uri: userProfile.profileImageUrl}}
          style={userProfileDetailStyles.profileImage}
        />
      );
    } else {
      // 기본 아바타 이미지 (dummyProfile 사용)
      return (
        <Image
          source={dummyProfile}
          style={userProfileDetailStyles.profileImage}
        />
      );
    }
  };

  const getGenderText = (gender: number) => {
    return gender === 1 ? t('profile.editProfile.male') : t('profile.editProfile.female');
  };

  const getAgeFromBirthDate = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getSchoolName = (schoolCode: number): string => {
    // TODO: 실제 학교 코드 매핑 로직 구현
    const schoolNames: Record<number, string> = {
      1: '부산대학교',
      2: '서울대학교',
      3: '연세대학교',
      4: '고려대학교',
      // 추가 학교들...
    };
    return schoolNames[schoolCode] || '알 수 없는 학교';
  };

  const getMajorName = (majorCode: number): string => {
    // TODO: 실제 전공 코드 매핑 로직 구현
    const majorNames: Record<number, string> = {
      1: '국어국문학과',
      2: '영어영문학과',
      3: '컴퓨터공학과',
      4: '경영학과',
      // 추가 전공들...
    };
    return majorNames[majorCode] || '알 수 없는 전공';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={userProfileDetailStyles.container}>
        <View style={userProfileDetailStyles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={userProfileDetailStyles.backButton}>
            <ChevronLeft width={24} height={24} color="#333333" />
          </TouchableOpacity>
        </View>
        <View style={userProfileDetailStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#384050" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !userProfile) {
    return (
      <SafeAreaView style={userProfileDetailStyles.container}>
        <View style={userProfileDetailStyles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={userProfileDetailStyles.backButton}>
            <ChevronLeft width={24} height={24} color="#333333" />
          </TouchableOpacity>
        </View>
        <View style={userProfileDetailStyles.errorContainer}>
          <Text style={userProfileDetailStyles.errorText}>
            {error?.message || t('profile.loadError')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={userProfileDetailStyles.container}>
      {/* 헤더 */}
      <View style={userProfileDetailStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={userProfileDetailStyles.backButton}>
          <ChevronLeft width={24} height={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={userProfileDetailStyles.scrollContainer}>
        {/* 프로필 이미지 */}
        <View style={userProfileDetailStyles.profileSection}>
          {renderProfileImage()}
        </View>

        {/* 사용자 기본 정보 */}
        <View style={userProfileDetailStyles.basicInfoSection}>
          <Text style={userProfileDetailStyles.userName}>
            {userProfile.nickName}
          </Text>
          <Text style={userProfileDetailStyles.description}>
            {userProfile.description || t('profile.defaultBio')}
          </Text>

          {/* 성별, 나이 */}
          <View style={userProfileDetailStyles.infoRow}>
            <View style={userProfileDetailStyles.infoItem}>
              <UserIcon width={20} height={20} color="#666666" />
              <Text style={userProfileDetailStyles.infoText}>
                {getGenderText(userProfile.gender)}, {getAgeFromBirthDate(userProfile.birthDate)}세
              </Text>
            </View>
          </View>

          {/* 학교, 전공 */}
          <View style={userProfileDetailStyles.infoRow}>
            <View style={userProfileDetailStyles.infoItem}>
              <SchoolIcon width={20} height={20} color="#666666" />
              <Text style={userProfileDetailStyles.infoText}>
                {getSchoolName(userProfile.school)} {getMajorName(userProfile.major)}
              </Text>
            </View>
          </View>
        </View>

        {/* 언어 정보 */}
        <View style={userProfileDetailStyles.languageSection}>
          <Text style={userProfileDetailStyles.sectionTitle}>{t('profile.languageSettings')}</Text>

          <View style={userProfileDetailStyles.languageContainer}>
            <View style={userProfileDetailStyles.languageColumn}>
              <View style={userProfileDetailStyles.languageItem}>
                <Text style={userProfileDetailStyles.languageLabel}>
                  {t('profile.myLanguage')}
                </Text>
                <Text style={userProfileDetailStyles.languageValue}>
                  {getLanguageText(userProfile.mainLanguage, t)}
                </Text>
              </View>

              <View style={userProfileDetailStyles.languageItem}>
                <Text style={userProfileDetailStyles.languageLabel}>
                  {t('profile.level')}
                </Text>
                <Text style={userProfileDetailStyles.languageValue}>
                  {getLanguageLevelText(userProfile.mainLanguageLevel, t)}
                </Text>
              </View>
            </View>

            <View style={userProfileDetailStyles.languageColumn}>
              <View style={userProfileDetailStyles.languageItem}>
                <Text style={userProfileDetailStyles.languageLabel}>
                  {t('profile.exchangeLanguage')}
                </Text>
                <Text style={userProfileDetailStyles.languageValue}>
                  {getLanguageText(userProfile.learningLanguage, t)}
                </Text>
              </View>

              <View style={userProfileDetailStyles.languageItem}>
                <Text style={userProfileDetailStyles.languageLabel}>
                  {t('profile.level')}
                </Text>
                <Text style={userProfileDetailStyles.languageValue}>
                  {getLanguageLevelText(userProfile.learningLanguageLevel, t)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 사용자 정보 섹션 */}
        <View style={userProfileDetailStyles.userInfoSection}>
          <Text style={userProfileDetailStyles.sectionTitle}>
            {userProfile.nickName} 님의 정보
          </Text>

          <TouchableOpacity style={userProfileDetailStyles.menuItem}>
            <Text style={userProfileDetailStyles.menuText}>{t('profile.myGroupsHistory')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={userProfileDetailStyles.menuItem}>
            <Text style={userProfileDetailStyles.menuText}>{t('profile.myParticipatingGroups')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={userProfileDetailStyles.menuItem}>
            <Text style={userProfileDetailStyles.menuText}>{t('profile.myLikes')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={userProfileDetailStyles.menuItem}
            onPress={() =>
              navigation.navigate('Guestbook', {
                userId: userProfile.userId,
                userNickname: userProfile.nickName,
              })
            }>
            <Text style={userProfileDetailStyles.menuText}>{t('profile.myGuestbook')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileDetail;
