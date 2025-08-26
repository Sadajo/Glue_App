import React, {useRef, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Switch,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {usePrivacySettings} from '../model/usePrivacySettings';
import {styles} from './styles/PrivacySettings.styles';

// 스켈레톤 컴포넌트
const SkeletonSettingItem = () => {
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
    <Animated.View style={[styles.skeletonItem, {opacity}]}>
      <View style={styles.skeletonTextWide} />
      <View style={styles.skeletonToggle} />
    </Animated.View>
  );
};

interface SettingItemProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  isLast?: boolean;
}

const SettingItem = ({
  label,
  value,
  onToggle,
  isLast,
}: SettingItemProps) => {
  const handleToggle = (newValue: boolean) => {
    console.log('토글 값 변경:', label, newValue);
    onToggle(newValue);
  };

  return (
    <View style={[styles.settingItem, isLast && styles.lastSettingItem]}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.toggleContainer}>
        <Switch
          value={value}
          onValueChange={handleToggle}
          trackColor={{false: '#D2D5DB', true: '#1DBFDC'}}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#D2D5DB"
        />
      </View>
    </View>
  );
};

export const PrivacySettingsScreen = () => {
  const {t} = useTranslation();
  const {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    updateMajor,
    updateMeetingHistory,
    updateLikeList,
    updateGuestbook,
  } = usePrivacySettings();

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>
            {t('profile.privacySettings')}
          </Text>
          <View style={styles.settingsList}>
            {Array.from({length: 4}).map((_, index) => (
              <SkeletonSettingItem key={index} />
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || t('common.error.default')}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('profile.privacySettings')}</Text>

        <View style={styles.settingsList}>
          <SettingItem
            label={t('profile.majorVisibility')}
            value={settings.currentMajorVisibility === 1}
            onToggle={updateMajor}
          />
          <SettingItem
            label={t('profile.meetingHistoryVisibility')}
            value={settings.currentMeetingHistoryVisibility === 1}
            onToggle={updateMeetingHistory}
          />
          <SettingItem
            label={t('profile.likeListVisibility')}
            value={settings.currentLikeListVisibility === 1}
            onToggle={updateLikeList}
          />
          <SettingItem
            label={t('profile.guestbookVisibility')}
            value={settings.currentGuestBookVisibility === 1}
            onToggle={updateGuestbook}
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
