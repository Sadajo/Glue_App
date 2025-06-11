/**
 * @format
 */

import 'text-encoding-polyfill';
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

// Background FCM 메시지 핸들러 등록 (앱이 백그라운드에 있을 때)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background FCM 메시지 수신:', remoteMessage);
  // 백그라운드에서는 Firebase가 자동으로 시스템 알림을 표시하므로
  // 여기서는 데이터 저장이나 배지 업데이트 등의 작업만 수행
  // 예: AsyncStorage에 메시지 저장, 배지 카운트 증가 등
});

AppRegistry.registerComponent(appName, () => App);
