// src/widgets/header/ui/CustomHeader.tsx
import React from 'react';
import {SafeAreaView, View, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BellIcon, SettingsIcon} from '@shared/assets/images';

interface CustomHeaderProps {
  title?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({title: _title}) => {
  const navigation = useNavigation<any>();

  // 터치 영역 확장 설정 (Home 헤더와 동일)
  const touchHitSlop = {top: 20, right: 20, bottom: 20, left: 20};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 좌측 빈 공간 */}
        <View style={styles.placeholder} />
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationsScreen')}
            style={styles.iconButton}
            hitSlop={touchHitSlop}>
            <BellIcon width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
            hitSlop={touchHitSlop}>
            <SettingsIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 19,
    backgroundColor: '#FFFFFF',
  },
  placeholder: {
    flex: 1, // 좌측 공간을 늘려서 아이콘들이 우측에 정렬되도록
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12, // Home 헤더의 아이콘 간격과 동일
  },
});
