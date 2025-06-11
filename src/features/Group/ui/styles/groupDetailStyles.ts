import {StyleSheet} from 'react-native';

export const groupDetailStyles = StyleSheet.create({
  // 헤더 영역 스타일
  headerContainer: {
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
  statusIcon: {
    width: 76,
    height: 13,
  },

  // 서브 헤더 스타일
  subHeaderContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 17,
  },
  subHeaderIcon: {
    width: 24,
    height: 24,
    marginVertical: 2,
  },
  subHeaderIconWithMargin: {
    width: 24,
    height: 24,
    marginRight: 12,
  },

  // 작성자 정보 스타일
  authorContainer: {
    alignItems: 'flex-start',
    marginBottom: 21,
  },
  categoryBadge: {
    backgroundColor: '#DEE9FC',
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 9,
    marginBottom: 12,
  },
  categoryText: {
    color: '#263FA9',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorTextContainer: {
    marginRight: 12,
  },
  authorName: {
    color: '#303030',
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorDate: {
    color: '#9DA2AF',
    fontSize: 12,
  },
  likeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  likeIcon: {
    width: 15,
    height: 15,
    marginRight: 8,
  },
  likeCount: {
    color: '#6C7180',
    fontSize: 12,
    marginRight: 2,
  },

  // 제목 및 내용 스타일
  title: {
    color: '#303030',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 11,
  },
  content: {
    color: '#384050',
    fontSize: 14,
    marginBottom: 20,
  },

  // 이미지 스타일
  contentImage: {
    height: 355,
    borderRadius: 8,
    marginBottom: 20,
  },

  // 모임 정보 스타일
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
    elevation: 5,
  },
  infoTitle: {
    color: '#303030',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoItemsContainer: {
    alignItems: 'flex-start',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 2,
    marginBottom: 12,
  },
  infoItemLast: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  infoIconWide: {
    width: 24,
    height: 24,
    marginRight: 17,
  },
  infoText: {
    color: '#384050',
    fontSize: 14,
  },

  // 좋아요 정보 스타일
  likesTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 45,
  },
  likesTotalIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  likesTotalText: {
    color: '#384050',
    fontSize: 14,
  },
});
