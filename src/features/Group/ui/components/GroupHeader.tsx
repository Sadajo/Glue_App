import React, {useState} from 'react';
import {View, TouchableOpacity, Modal, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {groupDetailStyles} from '../styles/groupDetailStyles';
import {ChevronLeft, Menu, Share} from '@shared/assets/images';
import {useTranslation} from 'react-i18next';
import {useBumpPost} from '../../api/hooks';
import {toastService} from '@shared/lib/notifications/toast';
import {secureStorage} from '@shared/lib/security';

interface GroupHeaderProps {
  creatorId?: number;
  postId?: number;
  onReportPress?: () => void;
}

/**
 * 모임 상세 페이지의 헤더 컴포넌트
 */
const GroupHeader: React.FC<GroupHeaderProps> = ({
  creatorId,
  postId,
  onReportPress,
}) => {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMyPost, setIsMyPost] = useState(false);
  const {mutate: bumpPostMutate} = useBumpPost();

  // 현재 로그인된 사용자 ID 확인
  React.useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('사용자 정보 확인 시작...');
        console.log('creatorId:', creatorId);

        // secureStorage에서 사용자 ID 가져오기
        const currentUserId = await secureStorage.getUserId();
        console.log('가져온 currentUserId:', currentUserId);

        // 내 게시글인지 확인
        if (creatorId && currentUserId && creatorId === currentUserId) {
          setIsMyPost(true);
          console.log(
            '내가 작성한 게시글입니다. creatorId:',
            creatorId,
            'currentUserId:',
            currentUserId,
          );
        } else {
          console.log(
            '내가 작성한 게시글이 아닙니다. creatorId:',
            creatorId,
            'currentUserId:',
            currentUserId,
          );

          // 디버깅용: 만약 사용자 ID를 가져오지 못했는데 creatorId가 있으면 임시로 메뉴 활성화
          if (!currentUserId && creatorId) {
            console.log(
              '경고: 사용자 ID를 찾을 수 없어 임시로 내 글로 판단합니다',
            );
            setIsMyPost(true);
          }
        }
      } catch (error) {
        console.error('사용자 정보 확인 오류:', error);
      }
    };

    checkUser();
  }, [creatorId]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleEditPost = () => {
    setMenuVisible(false);
    // 게시글 수정 페이지로 이동
    if (postId) {
      navigation.navigate('EditGroup', {postId});
    }
  };

  const handleBumpPost = () => {
    setMenuVisible(false);

    if (!postId) return;

    // 게시글 끌어올리기 API 호출
    bumpPostMutate(postId, {
      onSuccess: () => {
        console.log('게시글 끌어올리기 성공:', postId);
        toastService.success(
          t('common.success'),
          t('group.detail.menu.bumpSuccess'),
        );
      },
      onError: (error: any) => {
        console.error('게시글 끌어올리기 실패:', error.message);
        toastService.error(
          t('common.error'),
          error.message || t('group.detail.joinError'),
        );
      },
    });
  };

  const handleDeletePost = () => {
    setMenuVisible(false);
    // 게시글 삭제 확인 다이얼로그 표시
    // TODO: 삭제 확인 다이얼로그 표시 후 삭제 API 호출
    console.log('게시글 삭제:', postId);
  };

  const handleReportPost = () => {
    setMenuVisible(false);
    // 신고하기 모달 열기
    if (onReportPress) {
      onReportPress();
    }
  };

  return (
    <>
      <View style={groupDetailStyles.subHeaderContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <ChevronLeft style={groupDetailStyles.subHeaderIcon} />
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <Share style={groupDetailStyles.subHeaderIconWithMargin} />
        <TouchableOpacity onPress={toggleMenu}>
          <Menu style={groupDetailStyles.subHeaderIcon} />
        </TouchableOpacity>
      </View>

      {/* 메뉴 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            {isMyPost ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleEditPost}>
                  <Text style={styles.menuText}>
                    {t('group.detail.menu.edit')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleBumpPost}>
                  <Text style={styles.menuText}>
                    {t('group.detail.menu.bump')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDeletePost}>
                  <Text style={styles.menuText}>
                    {t('group.detail.menu.delete')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleReportPost}>
                <Text style={styles.menuText}>
                  {t('group.detail.menu.report') || '신고하기'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default GroupHeader;
