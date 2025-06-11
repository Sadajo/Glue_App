import React, {useState} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Text} from '@shared/ui/typography';
import {Button} from '@shared/ui';
import {colors, semanticColors} from '@app/styles/colors';
import {ReportIcon} from '@shared/assets/images';
import {useTranslation} from 'react-i18next';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (reasonId: number) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onReport,
}) => {
  const {t} = useTranslation();
  const [selectedReason, setSelectedReason] = useState<number | null>(null);

  const reportReasons = [
    {id: 1, text: t('group.detail.menu.reportModal.reasons.spam')},
    {id: 2, text: t('group.detail.menu.reportModal.reasons.adult')},
    {id: 3, text: t('group.detail.menu.reportModal.reasons.illegal')},
    {id: 4, text: t('group.detail.menu.reportModal.reasons.hate')},
  ];

  const handleReasonSelect = (reasonId: number) => {
    setSelectedReason(reasonId);
  };

  const handleReport = () => {
    if (selectedReason !== null) {
      onReport(selectedReason);
      setSelectedReason(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <ReportIcon width={24} height={24} style={styles.reportIcon} />
              <Text variant="h4" weight="bold" style={styles.title}>
                {t('group.detail.menu.reportModal.title')}
              </Text>
            </View>
          </View>

          {/* 신고 사유 선택 */}
          <View style={styles.reasonContainer}>
            {reportReasons.map(reason => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonItem,
                  selectedReason === reason.id && styles.selectedReasonItem,
                ]}
                onPress={() => handleReasonSelect(reason.id)}>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedReason === reason.id && styles.radioSelected,
                    ]}>
                    {selectedReason === reason.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text
                    variant="body1"
                    style={[
                      styles.reasonText,
                      selectedReason === reason.id && styles.selectedReasonText,
                    ]}>
                    {reason.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 신고하기 버튼 */}
          <Button
            label={t('group.detail.menu.reportModal.submitButton')}
            onPress={handleReport}
            disabled={selectedReason === null}
            style={StyleSheet.flatten([
              styles.reportButton,
              selectedReason === null && styles.disabledButton,
            ])}
            textStyle={StyleSheet.flatten([
              styles.reportButtonText,
              selectedReason === null && styles.disabledButtonText,
            ])}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const {width: screenWidth} = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: screenWidth - 40,
    maxWidth: 350,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    color: semanticColors.text,
    textAlign: 'left',
    flex: 1,
  },
  reasonContainer: {
    marginBottom: 32,
  },
  reasonItem: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  selectedReasonItem: {
    // 선택된 아이템 스타일
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
    borderColor: colors.lightSilver,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.maximumBlueGreen,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.maximumBlueGreen,
  },
  reasonText: {
    fontSize: 16,
    color: semanticColors.textSecondary,
    flex: 1,
  },
  selectedReasonText: {
    color: semanticColors.text,
  },
  reportButton: {
    backgroundColor: colors.batteryChargedBlue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.lightSilver,
  },
  disabledButtonText: {
    color: colors.manatee,
  },
});

export default ReportModal;
