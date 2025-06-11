// src/features/Profile/ui/styles/LanguageCard.styles.ts
import {StyleSheet} from 'react-native';
import {typography, spacing} from '@app/styles';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subtitle2,
    color: '#333333',
    fontWeight: '600',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#E2FBE8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: spacing.sm,
  },
  edit: {
    ...typography.button,
    color: '#1DBFDC',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body2,
    color: '#666666',
    fontSize: 13,
  },
  value: {
    ...typography.body1,
    color: '#333333',
    fontWeight: '500',
  },
});
