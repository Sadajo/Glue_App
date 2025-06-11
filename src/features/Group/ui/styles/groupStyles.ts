import {StyleSheet} from 'react-native';

// 모임 화면에서 공통적으로 사용되는 스타일 정의
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 41,
    paddingRight: 19,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16.5,
    paddingHorizontal: 19,
  },
  subHeaderTitle: {
    color: '#303030',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 7,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
    marginHorizontal: 19,
  },
  statusIcon: {
    width: 76,
    height: 13,
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
  iconRight: {
    marginRight: 12,
  },
  flexFill: {
    flex: 1,
  },
  // 카테고리 선택기 스타일
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// 그룹 목록 아이템 관련 스타일
export const groupListStyles = StyleSheet.create({
  itemContainer: {
    marginHorizontal: 19,
  },
  itemContainerNoImage: {
    alignItems: 'flex-start',
    marginHorizontal: 19,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginHorizontal: 4,
    width: '100%',
  },
  categoryBadge: {
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 9,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 2,
    marginLeft: 'auto',
  },
  likeIcon: {
    width: 15,
    height: 15,
    marginRight: 8,
  },
  likesText: {
    color: '#6C7180',
    fontSize: 12,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  itemContentNoImage: {
    alignItems: 'flex-start',
    marginLeft: 4,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: 12,
  },
  title: {
    color: '#303030',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#384050',
    fontSize: 14,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 3,
    marginRight: 12,
  },
  metaIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  metaText: {
    color: '#6C7180',
    fontSize: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
});

// 그룹 상세 화면 관련 스타일
export const groupDetailStyles = StyleSheet.create({
  detailContainer: {
    marginHorizontal: 19,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#303030',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    color: '#384050',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  scheduleText: {
    color: '#384050',
    fontSize: 14,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  hostName: {
    color: '#303030',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hostDescription: {
    color: '#6C7180',
    fontSize: 12,
  },
  participantsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  participantAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  participantCount: {
    color: '#6C7180',
    fontSize: 12,
    marginTop: 5,
  },
});

// 하단 탭바와 버튼 관련 스타일
export const navigationStyles = StyleSheet.create({
  bottomTabContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 35,
    shadowColor: '#0000000D',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  tabHomeIcon: {
    width: 25,
    height: 44,
  },
  tabLabelActive: {
    color: '#1CBFDC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabLabelInactive: {
    color: '#9DA2AF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomIndicator: {
    width: 140,
    height: 5,
    backgroundColor: '#384050',
    borderRadius: 2222,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#1CBFDC',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#0000001A',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    elevation: 4,
  },
  floatingButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  floatingButtonTextContainer: {},
  floatingButtonText: {
    color: '#1CBFDC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingButtonBadge: {
    position: 'absolute',
    bottom: -8,
    right: 4,
    width: 15,
    height: 15,
  },
  joinButton: {
    width: '100%',
    backgroundColor: '#1CBFDC',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
