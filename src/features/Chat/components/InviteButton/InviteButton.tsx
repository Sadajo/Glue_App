import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {styles} from './styles';

interface InviteButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const InviteButton: React.FC<InviteButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        초대하기
      </Text>
    </TouchableOpacity>
  );
};

export default InviteButton;
