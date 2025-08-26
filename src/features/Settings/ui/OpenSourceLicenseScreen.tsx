import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {ChevronLeft} from '@shared/assets/images';

interface OpenSourceLibrary {
  id: string;
  name: string;
  version: string;
  license: string;
  description: string;
  licenseText: string;
}

const OpenSourceLicenseScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const [selectedLibrary, setSelectedLibrary] =
    useState<OpenSourceLibrary | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const openSourceLibraries: OpenSourceLibrary[] = [
    {
      id: '1',
      name: 'React Native',
      version: '0.72.0',
      license: 'MIT',
      description: 'A framework for building native applications using React',
      licenseText: `MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    {
      id: '2',
      name: 'React Navigation',
      version: '6.1.0',
      license: 'MIT',
      description: 'Routing and navigation for your React Native apps',
      licenseText: `MIT License

Copyright (c) 2017 React Navigation Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    {
      id: '3',
      name: 'React Query',
      version: '3.39.0',
      license: 'MIT',
      description:
        'Hooks for fetching, caching and updating asynchronous data in React',
      licenseText: `MIT License

Copyright (c) 2019 Tanner Linsley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    {
      id: '4',
      name: 'React Native Vector Icons',
      version: '10.0.0',
      license: 'MIT',
      description: 'Customizable Icons for React Native',
      licenseText: `MIT License

Copyright (c) 2015 Joel Arvidsson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    {
      id: '5',
      name: 'React Native Toast Message',
      version: '1.4.9',
      license: 'MIT',
      description: 'A toast component for React Native',
      licenseText: `MIT License

Copyright (c) 2020 Calin Tamas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    {
      id: '6',
      name: 'i18next',
      version: '23.0.0',
      license: 'MIT',
      description: 'Internationalization framework for JavaScript',
      licenseText: `MIT License

Copyright (c) 2011-2023 i18next

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
  ];

  const handleLibraryPress = (library: OpenSourceLibrary) => {
    setSelectedLibrary(library);
    setIsDetailModalVisible(true);
  };

  const renderLibraryItem = ({item}: {item: OpenSourceLibrary}) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => handleLibraryPress(item)}>
      <View style={styles.itemHeader}>
        <Text variant="body1" weight="semiBold" style={styles.libraryName}>
          {item.name}
        </Text>
        <View style={styles.licenseBadge}>
          <Text variant="caption" weight="bold" style={styles.licenseText}>
            {item.license}
          </Text>
        </View>
      </View>
      <Text variant="caption" style={styles.libraryVersion}>
        v{item.version}
      </Text>
      <Text variant="body2" style={styles.libraryDescription}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
          <ChevronLeft width={24} height={24} color="#1CBFDC" />
        </TouchableOpacity>
        <Text variant="h6" weight="semiBold">
          오픈소스 라이선스
        </Text>
        <View style={{width: 40}} />
      </View>

      <FlatList
        data={openSourceLibraries}
        renderItem={renderLibraryItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* 라이선스 상세 모달 */}
      {selectedLibrary && (
        <View
          style={[
            styles.modalOverlay,
            {display: isDetailModalVisible ? 'flex' : 'none'},
          ]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h6" weight="semiBold" style={styles.modalTitle}>
                {selectedLibrary.name}
              </Text>
              <TouchableOpacity
                onPress={() => setIsDetailModalVisible(false)}
                style={styles.closeButton}>
                <Text variant="h6" weight="bold">
                  ×
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalInfo}>
                <Text variant="body2" style={styles.modalVersion}>
                  Version: {selectedLibrary.version}
                </Text>
                <Text variant="body2" style={styles.modalLicense}>
                  License: {selectedLibrary.license}
                </Text>
                <Text variant="body2" style={styles.modalDescription}>
                  {selectedLibrary.description}
                </Text>
              </View>
              <View style={styles.licenseSection}>
                <Text
                  variant="subtitle1"
                  weight="semiBold"
                  style={styles.licenseTitle}>
                  License Text
                </Text>
                <Text variant="body2" style={styles.licenseContent}>
                  {selectedLibrary.licenseText}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  libraryItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 4,
  },
  libraryName: {
    flex: 1,
    color: '#333333',
  },
  licenseBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  licenseText: {
    color: '#1976D2',
    fontSize: 10,
  },
  libraryVersion: {
    color: '#666666',
    marginBottom: 8,
  },
  libraryDescription: {
    color: '#666666',
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    maxHeight: '90%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    flex: 1,
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalInfo: {
    marginBottom: 24,
  },
  modalVersion: {
    color: '#666666',
    marginBottom: 4,
  },
  modalLicense: {
    color: '#666666',
    marginBottom: 8,
  },
  modalDescription: {
    color: '#333333',
    lineHeight: 20,
  },
  licenseSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  licenseTitle: {
    color: '#333333',
    marginBottom: 12,
  },
  licenseContent: {
    color: '#333333',
    lineHeight: 20,
    fontSize: 12,
    fontFamily: 'monospace',
  },
};

export default OpenSourceLicenseScreen;
