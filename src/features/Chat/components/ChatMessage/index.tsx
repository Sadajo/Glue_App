import React, {useEffect, useRef} from 'react';
import {View, Text, Image, StyleSheet, Animated} from 'react-native';
import {Crown, dummyProfile} from '@shared/assets/images';
// 인라인 스타일 정의
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginLeft: 19,
    marginRight: 19,
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  contentContainer: {
    alignItems: 'flex-start',
    marginRight: 8,
    maxWidth: '70%',
  },
  myContentContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
    marginRight: 0,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderName: {
    color: '#303030',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  hostIcon: {
    width: 16,
    height: 16,
  },
  bubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    minWidth: 30,
  },
  myBubble: {
    backgroundColor: '#1CBFDC',
  },
  messageText: {
    color: '#303030',
    fontSize: 14,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  myTimestampContainer: {
    marginRight: 8,
    paddingRight: 0,
    marginLeft: 3,
  },
  timestamp: {
    color: '#303030',
    fontSize: 10,
    marginRight: 6,
  },
});

export interface MessageProps {
  id: string;
  text: string;
  isMine: boolean;
  sender: {
    id: string;
    name: string;
    isHost?: boolean;
    profileImage: string;
  };
  timestamp: string;
}

const ChatMessage: React.FC<MessageProps> = ({
  text,
  isMine,
  sender,
  timestamp,
}) => {
  // 애니메이션을 위한 Animated Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 컴포넌트가 마운트될 때 애니메이션 실행
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        isMine ? styles.myContainer : styles.otherContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {!isMine && (
        <Image
          source={
            sender.profileImage && sender.profileImage.trim() !== ''
              ? {uri: sender.profileImage}
              : dummyProfile
          }
          resizeMode="cover"
          style={styles.profileImage}
        />
      )}

      <View
        style={[styles.contentContainer, isMine && styles.myContentContainer]}>
        {!isMine && (
          <View style={styles.senderContainer}>
            <Text style={styles.senderName}>{sender.name}</Text>
            {sender.isHost && <Crown style={styles.hostIcon} />}
          </View>
        )}

        <View style={[styles.bubble, isMine && styles.myBubble]}>
          <Text style={[styles.messageText, isMine && styles.myMessageText]}>
            {text}
          </Text>
        </View>

        <View
          style={[
            styles.timestampContainer,
            isMine && styles.myTimestampContainer,
          ]}>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>

      {/* {isMine && (
        // <Image
        //   source={{uri: sender.profileImage}}
        //   resizeMode="cover"
        //   style={styles.profileImage}
        // />
      )} */}
    </Animated.View>
  );
};

export default ChatMessage;
