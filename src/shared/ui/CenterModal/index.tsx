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

export interface CenterModalOption {
  label: string;
  value: string;
}

interface CenterModalProps {
  title: string;
  options: CenterModalOption[];
  isVisible: boolean;
  onClose: () => void;
  onSelect: (option: CenterModalOption) => void;
  selectedValue?: string;
}

export const CenterModal: React.FC<CenterModalProps> = ({
  title,
  options,
  isVisible,
  onClose,
  onSelect,
  selectedValue,
}) => {
  const {t} = useTranslation();
  // 옵션 선택 핸들러
  const handleOptionSelect = (option: CenterModalOption) => {
    onSelect(option);
    onClose();
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
            <Text variant="subtitle1" weight="semiBold" style={styles.title}>{title}</Text>

            {/* 옵션 목록 */}
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    index === options.length - 1 && styles.lastOptionItem,
                  ]}
                  activeOpacity={0.6}
                  onPress={() => handleOptionSelect(option)}>
                  {/* 라디오 버튼 */}
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioOuter,
                        option.value === selectedValue && styles.radioSelected,
                      ]}>
                      {option.value === selectedValue && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text variant="body1" weight="regular" style={styles.optionText}>{option.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 선택하기 버튼 */}
            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.8}
              onPress={onClose}>
              <Text variant="button" weight="semiBold" style={styles.confirmButtonText}>{t('common.select')}</Text>
            </TouchableOpacity>
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
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#1CBFDC',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1CBFDC',
  },
  optionText: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#1CBFDC',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});
