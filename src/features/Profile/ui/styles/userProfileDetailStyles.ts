import {StyleSheet} from 'react-native';

export const userProfileDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    // padding: 8,
  },

  backButtonText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },

  scrollContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },

  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
  },

  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },

  avatarText: {
    fontSize: 40,
  },

  basicInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  infoRow: {
    marginBottom: 12,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 16,
    marginRight: 12,
  },

  infoText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },

  languageSection: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },

  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  languageColumn: {
    flex: 1,
    marginHorizontal: 8,
  },

  languageItem: {
    marginBottom: 16,
  },

  languageLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },

  languageValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },

  userInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  menuText: {
    fontSize: 16,
    color: '#333333',
  },

  menuArrow: {
    fontSize: 16,
    color: '#999999',
  },
});
