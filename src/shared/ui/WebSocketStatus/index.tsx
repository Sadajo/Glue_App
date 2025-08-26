import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useWebSocket} from '@/app/providers/websocket';

interface WebSocketStatusProps {
  showReconnectButton?: boolean;
  style?: any;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  showReconnectButton = false,
  style,
}) => {
  const {status, isConnected, reconnect, checkAndConnect} = useWebSocket();

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#10B981'; // green
      case 'connecting':
        return '#F59E0B'; // yellow
      case 'error':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return '연결됨';
      case 'connecting':
        return '연결 중...';
      case 'error':
        return '연결 오류';
      default:
        return '연결 안됨';
    }
  };

  const handleReconnect = async () => {
    if (status === 'disconnected') {
      await checkAndConnect();
    } else {
      await reconnect();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, {backgroundColor: getStatusColor()}]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {showReconnectButton && !isConnected && (
        <TouchableOpacity
          style={styles.reconnectButton}
          onPress={handleReconnect}>
          <Text style={styles.reconnectButtonText}>재연결</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  reconnectButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  reconnectButtonText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
