import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import ChatRoomListScreen from './ui/ChatRoomListScreen';
import ChatRoomScreen from './ui/ChatRoomScreen';
import GroupChatRoomScreen from './ui/GroupChatRoomScreen';
import {fetchChatRooms} from './model';
import {ChatRoom} from './entities/types';
import {webSocketService} from './lib/websocket';

// 네비게이션을 위한 스택 생성
const Stack = createStackNavigator();

/**
 * 채팅 기능 메인 컴포넌트
 */
const Chat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<string>('disconnected');

  // WebSocket 상태 모니터링
  useEffect(() => {
    const handleStatusChange = (status: string) => {
      console.log('[Chat] WebSocket 상태 변경:', status);
      setWsStatus(status);
    };

    webSocketService.onConnectionStatusChange(handleStatusChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      webSocketService.onConnectionStatusChange(null);
    };
  }, []);

  // 채팅방 목록 로드
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        setLoading(true);
        const rooms = await fetchChatRooms();
        setChatRooms(rooms);
      } catch (error) {
        console.error('채팅방 목록을 불러오는데 실패했습니다:', error);
        setError('채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadChatRooms();
  }, []);

  // 에러 발생 시 표시
  if (error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'red'}}>{error}</Text>
        <Text style={{color: 'blue', marginTop: 10}}>
          WebSocket 상태: {wsStatus}
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="ChatRoomList"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="ChatRoomList">
        {props => (
          <ChatRoomListScreen
            {...props}
            chatRooms={chatRooms}
            onDmChatRoomPress={dmRoomId => {
              console.log('[Chat] DM 채팅방으로 네비게이션:', dmRoomId);
              props.navigation.navigate('ChatRoom', {dmChatRoomId: dmRoomId});
            }}
            onGroupChatRoomPress={groupChatroomId => {
              console.log(
                '[Chat] 그룹 채팅방으로 네비게이션:',
                groupChatroomId,
              );
              props.navigation.navigate('GroupChatRoomScreen', {
                groupChatroomId: groupChatroomId,
              });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen
        name="GroupChatRoomScreen"
        component={GroupChatRoomScreen}
      />
    </Stack.Navigator>
  );
};

export default Chat;
