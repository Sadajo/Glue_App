import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, BackHandler} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import Header from './components/Header';
import BannerSection from './components/BannerSection';
import CategorySection from './components/CategorySection';
import CategorySection2 from './components/CategorySection2';

const HomeScreen = () => {
  const {t} = useTranslation();

  // 뒤로가기 버튼을 막는 로직
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // 뒤로가기를 막고 아무것도 하지 않음 (Welcome 화면으로 돌아가지 않음)
        return true;
      };

      // Android의 하드웨어 뒤로가기 버튼 이벤트 리스너 등록
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      // 화면이 포커스를 잃을 때 리스너 제거
      return () => backHandler.remove();
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView style={styles.scrollContainer}>
        <BannerSection />
        <CategorySection title={t('home.popular')} />
        <CategorySection2 title={t('home.languageExchange')} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default HomeScreen;
