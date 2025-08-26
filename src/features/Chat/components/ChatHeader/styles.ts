import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 17,
  },
  backButton: {
    width: 24,
    height: 24,
  },
  title: {
    color: '#303030',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButton: {
    width: 24,
    height: 24,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
