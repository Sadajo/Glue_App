// src/features/Profile/ui/MyProfileDetailScreen.tsx
import React from 'react';
import { SafeAreaView, View, TouchableOpacity } from 'react-native';
import { Text } from '@shared/ui/typography/Text';

import { useMyPage } from '../model/useMyPage';
import { styles } from './styles/MyProfileDetail.styles';

export const MyProfileDetailScreen = ({ navigation }) => {
  const { myPageInfo, isLoading, isError } = useMyPage();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !myPageInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error loading profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Nickname</Text>
        <Text style={styles.value}>{myPageInfo.userNickname}</Text>
        <Text style={styles.label}>Bio</Text>
        <Text style={styles.value}>{myPageInfo.description}</Text>
        <Text style={styles.label}>Main Language</Text>
        <Text style={styles.value}>{myPageInfo.mainLanguage}</Text>
        <Text style={styles.label}>Main Language Level</Text>
        <Text style={styles.value}>{myPageInfo.mainLanguageLevel}</Text>
        <Text style={styles.label}>Learning Language</Text>
        <Text style={styles.value}>{myPageInfo.learningLanguage}</Text>
        <Text style={styles.label}>Learning Language Level</Text>
        <Text style={styles.value}>{myPageInfo.learningLanguageLevel}</Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('ProfileEdit')}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};