import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import {colors} from '@app/styles/colors';
import {useTranslation} from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Text} from '@shared/ui/typography/Text';

type BirthDateInputProps = {
  onBirthDateChange: (date: Date) => void;
  initialDate?: Date | null;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BirthDateInput = ({
  onBirthDateChange,
  initialDate = null,
}: BirthDateInputProps) => {
  const [birthDate, setBirthDate] = useState<Date | null>(initialDate || null);
  const [modalVisible, setModalVisible] = useState(false);
  const {t, i18n} = useTranslation();

  // 현재 언어에 따른 locale 설정
  const currentLocale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';

  // 기본 날짜는 2002년 6월 24일
  const defaultDate = new Date(2002, 5, 24);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setModalVisible(false);
    }

    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (selectedDateOnly < today) {
        setBirthDate(selectedDate);
        onBirthDateChange(selectedDate);
      }
    }
  };

  const openDatePicker = () => {
    setModalVisible(true);
  };

  const closeDatePicker = () => {
    setModalVisible(false);
  };

  const confirmIOSDate = () => {
    closeDatePicker();
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="h2"
          weight="semiBold"
          color={colors.richBlack}
          style={styles.title}>
          {t('signup.birthdate.title')}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.dateInput} onPress={openDatePicker}>
          <Text
            variant="body1"
            weight="bold"
            color={!birthDate ? colors.auroMetalSaurus : colors.richBlack}
            style={styles.dateText}>
            {birthDate
              ? formatDate(birthDate)
              : t('signup.birthdate.placeholder')}
          </Text>
        </TouchableOpacity>
        <View style={styles.inputBorder}></View>
      </View>

      {/* 날짜 선택 모달 */}
      {Platform.OS === 'ios' ? (
        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={closeDatePicker}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={closeDatePicker}
                  style={styles.modalButton}>
                  <Text
                    variant="button"
                    color={colors.batteryChargedBlue}
                    style={styles.modalButtonText}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <Text
                  variant="h4"
                  color={colors.richBlack}
                  style={styles.modalTitle}>
                  {t('signup.birthdate.selectDate')}
                </Text>
                <TouchableOpacity
                  onPress={confirmIOSDate}
                  style={styles.modalButton}>
                  <Text
                    variant="button"
                    weight="semiBold"
                    color={colors.batteryChargedBlue}
                    style={styles.modalButtonText}>
                    {t('common.ok')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimePickerContainer}>
                <DateTimePicker
                  value={birthDate || defaultDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  style={styles.dateTimePicker}
                  locale={currentLocale}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        modalVisible && (
          <DateTimePicker
            value={birthDate || defaultDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            locale={currentLocale}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 64,
  },
  title: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 40,
  },
  dateInput: {
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 18,
  },
  inputBorder: {
    height: 1,
    backgroundColor: colors.lightSilver,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.ghostWhite,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    width: '100%',
  },
  dateTimePickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSilver,
  },
  modalButton: {
    padding: 8,
  },
  modalButtonText: {fontSize: 18},
  confirmButton: {},
  modalTitle: {},
  dateTimePicker: {
    height: 200,
    width: '100%',
  },
});

export default BirthDateInput;
