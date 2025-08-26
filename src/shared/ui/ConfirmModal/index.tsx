import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../typography/Text';

interface ConfirmModalProps {
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'primary' | 'destructive';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  isVisible,
  onClose,
  onConfirm,
  confirmText,
  cancelText,
  confirmButtonStyle = 'primary',
}) => {
  const {t} = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getConfirmButtonStyles = () => {
    if (confirmButtonStyle === 'destructive') {
      return [styles.confirmButton, styles.destructiveButton];
    }
    return [styles.confirmButton, styles.primaryButton];
  };

  const getConfirmButtonTextStyles = () => {
    return styles.confirmButtonText;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      {/* 백드롭 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* 모달 컨텐츠 */}
        <View style={styles.modalContainer}>
          <Pressable>
            {/* 타이틀 */}
            <Text variant="subtitle1" weight="semiBold" style={styles.title}>
              {title}
            </Text>

            {/* 메시지 */}
            <Text variant="body1" weight="regular" style={styles.message}>
              {message}
            </Text>

            {/* 버튼 영역 */}
            <View style={styles.buttonContainer}>
              {/* 취소 버튼 */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                activeOpacity={0.8}
                onPress={onClose}>
                <Text
                  variant="button"
                  weight="semiBold"
                  style={styles.cancelButtonText}>
                  {cancelText || t('common.cancel')}
                </Text>
              </TouchableOpacity>

              {/* 확인 버튼 */}
              <TouchableOpacity
                style={[styles.button, ...getConfirmButtonStyles()]}
                activeOpacity={0.8}
                onPress={handleConfirm}>
                <Text
                  variant="button"
                  weight="semiBold"
                  style={getConfirmButtonTextStyles()}>
                  {confirmText || t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333333',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666666',
  },
  confirmButton: {
    // 기본 스타일은 하위 스타일에서 정의
  },
  primaryButton: {
    backgroundColor: '#1CBFDC',
  },
  destructiveButton: {
    backgroundColor: '#FF4444',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});