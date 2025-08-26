// src/features/Profile/ui/styles/MyInfoItem.styles.ts
import {StyleSheet} from 'react-native';
import {typography, spacing} from '@app/styles';

export const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    ...typography.body1,
    color: '#333333',
    fontSize: 16,
  },
});
