import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import ConversationService from '../services/ConversationService';
import StorageService from '../services/StorageService';
import WebSocketService, { WebSocketMessage } from '../services/WebSocketService';
import { Message } from '../types/message';

const ConversationDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId } = route.params as { conversationId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [wsService] = useState(() => WebSocketService.getInstance());

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await StorageService.getUserInfo();
      if (user) {
        setCurrentUser(user);
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await ConversationService.getMessages(conversationId);
        setMessages(response.data);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    // Handle incoming messages
    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === 'MESSAGE' && message.payload.conversation_id === conversationId) {
        setMessages(prevMessages => [...prevMessages, message.payload]);
      }
    };

    wsService.onMessage(handleMessage);

    return () => {
      wsService.offMessage(handleMessage);
    };
  }, [conversationId, wsService]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    try {
      setLoading(true);
      const response = await ConversationService.sendMessage({
        type: 'text',
        body: messageText.trim(),
        conversation_id: conversationId,
        user_online_id: "currentUser.user_online_id"
      });

      if (response?.data) {
        setMessages(prevMessages => [...prevMessages, response.data]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.user?.user_id === currentUser?.user_id;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Image
            source={{ uri: item.user?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          {!isCurrentUser && (
            <Text style={styles.userName}>{item.user?.full_name}</Text>
          )}
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserMessageText : styles.otherUserMessageText
          ]}>
            {item.body}
          </Text>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserMessageTime : styles.otherUserMessageTime
          ]}>
            {new Date(item.created_at).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.message_id || `${item.created_at}-${item.user?.user_id}`}
            contentContainerStyle={styles.messagesList}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MaterialIcons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    marginLeft: 50,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    marginRight: 50,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA',
    borderTopLeftRadius: 4,
  },
  userName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  currentUserMessageText: {
    color: '#FFFFFF',
  },
  otherUserMessageText: {
    color: '#000000',
  },
  currentUserMessageTime: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  otherUserMessageTime: {
    color: '#666666',
  },
});

export default ConversationDetailScreen; 