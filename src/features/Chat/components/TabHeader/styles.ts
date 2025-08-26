import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 15,
    marginLeft: 20,
    marginTop: 19,
  },
  activeTab: {
    color: '#303030',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  inactiveTab: {
    color: '#D2D5DB',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabButton: {
    alignItems: 'center',
    marginRight: 10,
    minWidth: 60,
  },
  indicator: {
    width: 50,
    height: 2,
    backgroundColor: '#394050',
    marginTop: 5,
    borderRadius: 10,
  },
});
