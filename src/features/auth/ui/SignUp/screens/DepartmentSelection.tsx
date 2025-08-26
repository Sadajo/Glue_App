import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Keyboard,
} from 'react-native';
import {colors} from '@app/styles/colors';
import {typography} from '@app/styles/typography';
import {departments, getDepartmentName, Department} from '../data/departments';
import {useTranslation} from 'react-i18next';
import SearchIcon from '@shared/assets/icons/SearchIcon';

type DepartmentSelectionProps = {
  selectedDepartment: Department | null;
  onDepartmentSelect: (department: Department) => void;
};

const DepartmentSelection = ({
  selectedDepartment,
  onDepartmentSelect,
}: DepartmentSelectionProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const {t, i18n} = useTranslation();
  const currentLanguage = i18n.language.startsWith('ko') ? 'ko' : 'en';

  // 검색어에 따른 필터링된 학과 목록
  const filteredDepartments = searchText
    ? departments.filter(dept => {
        const deptName = getDepartmentName(dept, currentLanguage);
        return deptName.toLowerCase().includes(searchText.toLowerCase());
      })
    : departments;

  const openModal = () => {
    setModalVisible(true);
    // 모달이 열리면 약간의 딜레이 후 검색창에 포커스
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 300);
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setSearchText('');
  };

  const handleSelect = (department: Department) => {
    // Department 객체 전체를 전달
    onDepartmentSelect(department);
    closeModal();
  };

  // 선택된 학과명 표시
  const getSelectedDepartmentDisplay = () => {
    if (!selectedDepartment) return '';
    return getDepartmentName(selectedDepartment, currentLanguage);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t('signup.department.title')}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.selector} onPress={openModal}>
          <View style={styles.selectorContent}>
            <Text
              style={[
                styles.selectorText,
                !selectedDepartment && styles.placeholderText,
              ]}>
              {selectedDepartment
                ? getSelectedDepartmentDisplay()
                : t('signup.department.placeholder')}
            </Text>
            <SearchIcon width={24} height={24} />
          </View>
        </TouchableOpacity>
        <View style={styles.selectorBorder} />
      </View>

      {/* 학과 선택 모달 */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.searchContainer}>
                {/* 검색창 */}
                <View style={styles.searchInputWrapper}>
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder={t('signup.department.search')}
                    placeholderTextColor="#9DA2AF"
                  />
                  <SearchIcon width={24} height={24} />
                </View>

                {/* 검색 결과 목록 */}
                <View style={styles.resultsContainer}>
                  <FlatList
                    data={filteredDepartments}
                    keyExtractor={item => item.code}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.departmentItem}
                        onPress={() => handleSelect(item)}>
                        <Text style={styles.departmentName}>
                          {getDepartmentName(item, currentLanguage)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    ...typography.h2,
    color: colors.richBlack,
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 40,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  label: {
    color: '#6C7180',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 9,
  },
  labelIcon: {
    width: 24,
    height: 24,
  },
  selector: {
    paddingVertical: 8,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectorText: {
    ...typography.body1,
    color: colors.richBlack,
    fontWeight: 'bold',
    fontSize: 18,
  },
  placeholderText: {
    color: colors.auroMetalSaurus,
  },
  dropdownIcon: {
    width: 24,
    height: 24,
  },
  selectorBorder: {
    height: 1,
    backgroundColor: '#D2D5DB',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000080',
  },
  modalOverlay: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    height: '45%',
  },
  searchContainer: {
    width: '100%',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D2D5DB',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 23,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0000001A',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    color: '#030712',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 0,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  resultsContainer: {
    maxHeight: 300,
  },
  departmentItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  departmentName: {
    color: '#030712',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default DepartmentSelection;
