import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from './styles';
import {ChevronLeft, Menu} from '@shared/assets/images';

interface ChatHeaderProps {
  title: string;
  memberCount: number;
  onBackPress: () => void;
  onMenuPress: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  memberCount,
  onBackPress,
  onMenuPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackPress}>
        <ChevronLeft style={styles.backButton} />
      </TouchableOpacity>

      <Text style={styles.title}>{`${title}  ${memberCount}`}</Text>

      <TouchableOpacity onPress={onMenuPress}>
        <Menu style={styles.menuButton} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatHeader;
