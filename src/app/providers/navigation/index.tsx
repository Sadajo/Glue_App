import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
// 홈/게시판 화면 컴포넌트 임포트
import {HomeScreen} from '@features/Home';

// 모임글 화면 컴포넌트 임포트
import {
  GroupList,
  GroupDetail,
  GroupSearch,
  GroupCreate,
  GroupCreateStep2,
  GroupCreateStep3,
  GroupCreateStep4,
} from '@features/Group';
import {GroupStackParamList} from '@features/Group/model/types';

// 채팅 화면 컴포넌트 임포트
import {ChatRoomListScreen, ChatRoomScreen} from '@features/Chat';
import GroupChatRoomScreen from '@features/Chat/ui/GroupChatRoomScreen';

// 프로필 화면 컴포넌트 임포트
import {
  ProfileMainScreen,
  ProfileEditScreen,
  MyPageScreen,
  PrivacySettingsScreen,
  MyProfileDetailScreen,
  GroupHistoryScreen,
  LikedGroupsScreen,
  MyParticipatingMeetingsScreen,
  UserProfileDetail,
  GuestbookScreen,
  DescriptionEditScreen,
} from '@features/Profile';

// 설정 화면 임포트
import {SettingsScreen} from '@features/Settings';
// 인증 화면 임포트
import {
  WelcomeScreen,
  AuthProfileNavigator,
  SignUpScreen,
} from '@features/auth';

// 헤더 컴포넌트 임포트
import CustomHeader from '@widgets/header/ui/CustomHeader';
import {BackButtonHeader} from '@widgets/header/ui';

// 알림 패널 임포트
import {NotificationsScreen} from '@features/notifications';

// SVG 아이콘 컴포넌트 임포트
import {
  HomeIcon,
  GroupIcon,
  ChatIcon,
  ProfileIcon,
} from '@widgets/bottomTab/icons';

// 네비게이션 스택 생성
const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const BoardStack = createNativeStackNavigator();
const GroupStack = createNativeStackNavigator<GroupStackParamList>();
const MessagesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();

// 네비게이션 헤더 스타일 정의
const navTheme = {
  colors: {
    primary: '#1CBFDC',
    secondary: '#44FF54',
    background: '#FFFFFF',
    card: '#F8F9FA',
    text: '#212529',
    border: '#E9ECEF',
    notification: '#FF3B30',
  },
};

// 공통 헤더 스타일 옵션
const commonHeaderOptions = {
  headerStyle: {
    backgroundColor: navTheme.colors.primary,
    elevation: 0, // Android 그림자 제거
    shadowOpacity: 0, // iOS 그림자 제거
    borderBottomWidth: 0,
    height: 60,
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 18,
  },
  headerShadowVisible: false,
};

// 홈/게시판 스택 네비게이터
const BoardNavigator = () => (
  <BoardStack.Navigator screenOptions={commonHeaderOptions}>
    <BoardStack.Screen
      name="BoardList"
      component={HomeScreen}
      options={{headerShown: false}}
    />
  </BoardStack.Navigator>
);

// 메시지 스택 네비게이터
const MessagesNavigator = () => (
  <MessagesStack.Navigator screenOptions={commonHeaderOptions}>
    <MessagesStack.Screen name="MessagesList" options={{headerShown: false}}>
      {props => (
        <ChatRoomListScreen
          {...props}
          chatRooms={[]} // 빈 배열로 초기화, 실제 데이터는 ChatRoomListScreen 내부에서 API로 로드
          onDmChatRoomPress={dmRoomId => {
            props.navigation.navigate('ChatRoom', {dmChatRoomId: dmRoomId});
          }}
          onGroupChatRoomPress={groupChatroomId => {
            props.navigation.navigate('GroupChatRoomScreen', {groupChatroomId});
          }}
        />
      )}
    </MessagesStack.Screen>
  </MessagesStack.Navigator>
);

// 프로필 스택 네비게이터
// const ProfileNavigator = () => (
//   <ProfileStack.Navigator screenOptions={commonHeaderOptions}>
//     <ProfileStack.Screen
//       name="ProfileMain"
//       component={ProfileMainScreen}
//       options={{headerShown: false}}
//     />
//     <ProfileStack.Screen
//       name="ProfileEdit"
//       component={ProfileEditScreen}
//       options={{
//         title: '프로필 수정',
//         headerBackTitle: '취소',
//       }}
//     />
//   </ProfileStack.Navigator>
// );

// 인증 스택 네비게이터
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      ...commonHeaderOptions,
      headerShown: false,
    }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="Profile" component={AuthProfileNavigator} />
  </AuthStack.Navigator>
);

// 모임글 스택 네비게이터
const GroupNavigator = () => {
  return (
    <GroupStack.Navigator
      screenOptions={{
        ...commonHeaderOptions,
        headerShown: false,
      }}>
      <GroupStack.Screen
        name="GroupList"
        component={GroupList}
        options={{headerShown: false}}
      />

      <GroupStack.Screen
        name="GroupSearch"
        component={GroupSearch}
        options={{headerShown: false}}
      />
    </GroupStack.Navigator>
  );
};

// 탭 아이콘 컴포넌트 (렌더링 함수 밖에서 정의)
const renderHomeIcon = ({color}: {color: string}) => (
  <HomeIcon color={color} size={28} />
);
const renderGroupIcon = ({color}: {color: string}) => (
  <GroupIcon color={color} size={28} />
);
const renderChatIcon = ({color}: {color: string}) => (
  <ChatIcon color={color} size={28} />
);
const renderProfileIcon = ({color}: {color: string}) => (
  <ProfileIcon color={color} size={28} />
);

// 헤더 컴포넌트들을 미리 생성
const ProfileDetailHeader = () => <BackButtonHeader title="내 프로필 상세" />;
const GroupHistoryHeader = () => <BackButtonHeader title="모임 히스토리" />;
const LikedGroupsHeader = () => <BackButtonHeader title="좋아요 목록" />;
const MyParticipatingMeetingsHeader = () => (
  <BackButtonHeader title="내가 참여 중인 모임" />
);
const PrivacySettingsHeader = () => <BackButtonHeader title="공개범위 설정" />;
const GuestbookHeader = () => <BackButtonHeader title="방명록" />;
const NotificationsHeader = () => <BackButtonHeader title="알림" />;

// 커스텀 헤더 랜더러
const ProfileNavigator = () => (
  <ProfileStack.Navigator
    initialRouteName="MyPage"
    screenOptions={{
      headerShown: true,
      header: () => <CustomHeader title="마이페이지" />,
    }}>
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileMainScreen}
      options={{headerShown: false}}
    />
    <ProfileStack.Screen
      name="MyPage"
      component={MyPageScreen}
      options={{headerShown: false}}
    />
  </ProfileStack.Navigator>
);
// 메인 탭 네비게이터
const MainTabNavigator = () => {
  // SafeArea 하단 여백 가져오기
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  return (
    <MainTab.Navigator
      screenOptions={{
        // 커스텀 헤더를 사용하여 모든 탭에 동일한 헤더 적용
        // header: renderHeader,
        headerShown: false,
        tabBarActiveTintColor: navTheme.colors.primary,
        tabBarInactiveTintColor: '#9DA2AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F0',
          borderTopWidth: 1,
          paddingBottom: insets.bottom, // 하단 SafeArea 적용
          height: 60 + insets.bottom, // 기본 높이 + 안전 영역
        },
      }}>
      <MainTab.Screen
        name="Board"
        component={BoardNavigator}
        options={{
          tabBarLabel: t('home.title'),
          tabBarIcon: renderHomeIcon,
        }}
      />
      <MainTab.Screen
        name="Group"
        component={GroupNavigator}
        options={{
          tabBarLabel: t('group.title'),
          tabBarIcon: renderGroupIcon,
        }}
      />

      <MainTab.Screen
        name="Messages"
        component={MessagesNavigator}
        options={{
          tabBarLabel: t('messages.title'),
          tabBarIcon: renderChatIcon,
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: t('profile.title'),
          tabBarIcon: renderProfileIcon,
        }}
      />
    </MainTab.Navigator>
  );
};

// 메인 네비게이터 (인증 후 진입)
const MainNavigator = () => (
  <MainStack.Navigator
    screenOptions={{headerShown: false}}
    initialRouteName="MainTabs">
    <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
    <MainStack.Screen
      name="NotificationsScreen"
      component={NotificationsScreen}
      options={{
        headerShown: true,
        header: NotificationsHeader,
      }}
    />
    <MainStack.Screen
      name="ProfileEdit"
      component={ProfileEditScreen}
      options={{
        headerShown: false,
      }}
    />
    <MainStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        headerShown: false,
      }}
    />
    <MainStack.Screen
      name="DescriptionEdit"
      component={DescriptionEditScreen}
      options={{
        headerShown: false,
      }}
    />
    <MainStack.Screen
      name="ProfileDetail"
      component={MyProfileDetailScreen}
      options={{
        headerShown: true,
        header: ProfileDetailHeader,
      }}
    />
    <MainStack.Screen
      name="GroupHistory"
      component={GroupHistoryScreen}
      options={{
        headerShown: true,
        header: GroupHistoryHeader,
      }}
    />
    <MainStack.Screen
      name="LikedGroups"
      component={LikedGroupsScreen}
      options={{
        headerShown: true,
        header: LikedGroupsHeader,
      }}
    />
    <MainStack.Screen
      name="MyParticipatingMeetings"
      component={MyParticipatingMeetingsScreen}
      options={{
        headerShown: true,
        header: MyParticipatingMeetingsHeader,
      }}
    />
    <MainStack.Screen
      name="PrivacySettings"
      component={PrivacySettingsScreen}
      options={{
        headerShown: true,
        header: PrivacySettingsHeader,
      }}
    />
    <MainStack.Screen
      name="Guestbook"
      component={GuestbookScreen as any}
      options={{
        headerShown: false,
      }}
    />
  </MainStack.Navigator>
);

// 앱 메인 네비게이터
export const AppNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Main" component={MainNavigator} />
      <GroupStack.Screen
        name="GroupCreate"
        component={GroupCreate}
        options={{
          headerShown: false,
        }}
      />
      <GroupStack.Screen
        name="GroupCreateStep2"
        component={GroupCreateStep2}
        options={{
          headerShown: false,
        }}
      />
      <GroupStack.Screen
        name="GroupCreateStep3"
        component={GroupCreateStep3}
        options={{
          headerShown: false,
        }}
      />
      <GroupStack.Screen
        name="GroupCreateStep4"
        component={GroupCreateStep4}
        options={{
          headerShown: false,
        }}
      />
      <GroupStack.Screen
        name="GroupDetail"
        component={GroupDetail}
        options={{headerShown: false}}
      />
      <GroupStack.Screen
        name="UserProfile"
        component={UserProfileDetail}
        options={{headerShown: false}}
      />
      <MessagesStack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={{headerShown: false}}
      />
      <MessagesStack.Screen
        name="GroupChatRoomScreen"
        component={GroupChatRoomScreen}
        options={{headerShown: false}}
      />
    </RootStack.Navigator>
  );
};
