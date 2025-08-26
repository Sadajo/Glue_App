import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {Button} from '@shared/ui/Button';
import {CenterModal, CenterModalOption} from '@shared/ui/CenterModal';
import {ChevronLeft} from '@shared/assets/images';
import Toast from 'react-native-toast-message';

const InquiryScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const [inquiryType, setInquiryType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);

  const inquiryTypes: CenterModalOption[] = [
    {label: '버그 리포트', value: 'bug'},
    {label: '기능 제안', value: 'feature'},
    {label: '계정 문제', value: 'account'},
    {label: '결제 문의', value: 'payment'},
    {label: '기타', value: 'other'},
  ];

  const handleSubmit = async () => {
    if (!inquiryType) {
      Alert.alert('알림', '문의 유형을 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '문의 내용을 입력해주세요.');
      return;
    }

    try {
      // TODO: 실제 API 호출로 변경
      console.log('문의 제출:', {inquiryType, title, content});

      Toast.show({
        type: 'success',
        text1: '문의가 성공적으로 제출되었습니다.',
        position: 'bottom',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '문의 제출에 실패했습니다.',
        position: 'bottom',
      });
    }
  };

  const getInquiryTypeLabel = (value: string) => {
    const type = inquiryTypes.find(t => t.value === value);
    return type ? type.label : '선택해주세요';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
          <ChevronLeft width={24} height={24} color="#1CBFDC" />
        </TouchableOpacity>
        <Text variant="h6" weight="semiBold">
          문의하기
        </Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text variant="subtitle1" weight="semiBold" style={styles.label}>
            문의 유형 *
          </Text>
          <TouchableOpacity
            style={styles.typeSelector}
            onPress={() => setIsTypeModalVisible(true)}>
            <Text
              variant="body1"
              weight="regular"
              style={[
                styles.typeText,
                {color: inquiryType ? '#333333' : '#999999'},
              ]}>
              {getInquiryTypeLabel(inquiryType)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text variant="subtitle1" weight="semiBold" style={styles.label}>
            제목 *
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해주세요"
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text variant="subtitle1" weight="semiBold" style={styles.label}>
            문의 내용 *
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="문의 내용을 자세히 작성해주세요"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text variant="caption" style={styles.charCount}>
            {content.length}/1000
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="문의 제출"
          onPress={handleSubmit}
          disabled={!inquiryType || !title.trim() || !content.trim()}
        />
      </View>

      <CenterModal
        title="문의 유형 선택"
        options={inquiryTypes}
        isVisible={isTypeModalVisible}
        onClose={() => setIsTypeModalVisible(false)}
        onSelect={option => {
          setInquiryType(option.value);
          setIsTypeModalVisible(false);
        }}
        selectedValue={inquiryType}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    marginBottom: 8,
    color: '#333333',
  },
  typeSelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  typeText: {
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    textAlign: 'right' as const,
    marginTop: 4,
    color: '#999999',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
};

export default InquiryScreen;
