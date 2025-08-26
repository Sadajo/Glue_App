import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {ChevronLeft} from '../../../../shared/assets/images';
import {colors} from '../../../../app/styles/colors';
import {Text} from '../../../../shared/ui/typography/Text';

interface GroupCreateHeaderProps {
  title: string;
  onBack: () => void;
}

const GroupCreateHeader: React.FC<GroupCreateHeaderProps> = ({
  title,
  onBack,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ChevronLeft style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginHorizontal: 17,
    position: 'relative',
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    color: colors.darkCharcoal,
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});

export default GroupCreateHeader;
