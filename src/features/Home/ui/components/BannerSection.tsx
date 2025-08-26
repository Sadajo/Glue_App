import React from 'react';
import {View, ScrollView, StyleSheet, Image, Text} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {getMainCarousel, CarouselImage} from '../../api/carouselApi';

const BannerSection = () => {
  // 캐러셀 데이터 조회
  const {data: carouselData, isLoading} = useQuery({
    queryKey: ['mainCarousel'],
    queryFn: () => getMainCarousel(),
    staleTime: 5 * 60 * 1000, // 5분
  });

  const images = carouselData?.images || [];
  const sortedImages = images.sort(
    (a: CarouselImage, b: CarouselImage) => a.displayOrder - b.displayOrder,
  );

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerScrollContent}
        style={styles.bannerScroll}>
        <View style={styles.bannerContainer}>
          {isLoading ? (
            // 로딩 중일 때 기본 배너
            <View
              style={[
                styles.banner,
                styles.bannerMarginLeft,
                styles.loadingBanner,
              ]}>
              <Text style={styles.loadingText}>로딩 중...</Text>
            </View>
          ) : sortedImages.length > 0 ? (
            // API 데이터가 있을 때
            sortedImages.map((image: CarouselImage) => (
              <View key={image.id} style={styles.bannerMarginLeft}>
                <Image
                  source={{uri: image.imageUrl}}
                  style={styles.banner}
                  resizeMode="cover"
                />
                {image.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText} numberOfLines={2}>
                      {image.description}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            // 데이터가 없을 때 기본 배너
            <>
              <View style={[styles.banner, styles.bannerMarginLeft]}></View>
              <View style={[styles.banner, styles.bannerMarginLeft]}></View>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#384050',
    marginBottom: 16,
    marginLeft: 19,
  },
  bannerScroll: {
    marginBottom: 31,
  },
  bannerScrollContent: {
    paddingHorizontal: 19,
  },
  bannerContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: 8,
    flexDirection: 'row',
  },
  banner: {
    width: 355,
    height: 173,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  bannerMarginLeft: {
    marginTop: 10,
    marginRight: 10,
  },
  loadingBanner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  descriptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BannerSection;
