import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import {styles} from './styles';
import {UserSummaryWithHostInfo} from '../../api/api';
import {dummyProfile} from '@shared/assets/images';

interface UserSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
  availableUsers: UserSummaryWithHostInfo[];
  isLoading?: boolean;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  visible,
  onClose,
  onSelectUser,
  availableUsers,
  isLoading = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleSelectUser = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleConfirm = () => {
    if (selectedUserId) {
      onSelectUser(selectedUserId);
      setSelectedUserId(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedUserId(null);
    onClose();
  };

  const renderUserItem = ({item}: {item: UserSummaryWithHostInfo}) => {
    const isSelected = selectedUserId === item.userId;

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => handleSelectUser(item.userId)}>
        <Image
          source={
            item.profileImageUrl ? {uri: item.profileImageUrl} : dummyProfile
          }
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text
            style={[styles.userName, isSelected && styles.userNameSelected]}>
            {item.userName}
          </Text>
          {item.isHost && <Text style={styles.hostBadge}>호스트</Text>}
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>초대할 사용자 선택</Text>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedUserId || isLoading}>
            <Text
              style={[
                styles.confirmButton,
                (!selectedUserId || isLoading) && styles.confirmButtonDisabled,
              ]}>
              {isLoading ? '처리중...' : '초대하기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 사용자 목록 */}
        <View style={styles.content}>
          {availableUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                초대 가능한 사용자가 없습니다
              </Text>
            </View>
          ) : (
            <FlatList
              data={availableUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.userId.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default UserSelectionModal;
