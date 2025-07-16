import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import ChatRoomListScreen from './ui/ChatRoomListScreen';
import ChatRoomScreen from './ui/ChatRoomScreen';
import {fetchChatRooms} from './model';
import {ChatRoom} from './entities/types';

// 네비게이션을 위한 스택 생성
const Stack = createStackNavigator();

/**
 * 채팅 기능 메인 컴포넌트
 */
const Chat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
};

export default Chat;
