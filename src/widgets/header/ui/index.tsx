import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../shared/ui/typography';
import {useTranslation} from 'react-i18next';

interface HeaderProps {
  route: {
    name: string;
  };
  theme?: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
  };
}

export const Header = (props: HeaderProps) => {
  const {theme} = props;
  const {t} = useTranslation();

  const getTitle = () => {
    switch (props.route.name) {
      case 'Board':
        return t('board.title');
      case 'Messages':
        return t('messages.title');
      case 'Profile':
        return t('profile.title');
      case 'Settings':
        return t('settings.title');
      case 'Home':
        return t('home.title');
      default:
        return props.route.name;
    }
  };

  return <View style={[styles.header]} />;
};

const styles = StyleSheet.create({
  header: {
    // height: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;

export {default as BackButtonHeader} from './BackButtonHeader';
export {default as CustomHeader} from './CustomHeader';
export {default as ProfileEditHeader} from './ProfileEditHeader';
export {default as SettingsHeader} from './SettingsHeader';
