import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import ConversationService from '../services/ConversationService';
import StorageService from '../services/StorageService';
import { Message } from '../types/message';
import { UserInfo } from '../types/user';

type ConversationDetailParams = {
  conversationId: string;
};

type ConversationDetailRouteProp = RouteProp<{ ConversationDetail: ConversationDetailParams }, 'ConversationDetail'>;

const ITEMS_PER_PAGE = 20;

const ConversationDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<ConversationDetailRouteProp>();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [conversationName, setConversationName] = useState('');
  const conversationId = route.params?.conversationId;

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await StorageService.getUserInfo();
      console.log('Current user info:', userInfo);
      setCurrentUser(userInfo);
    };
    loadUserInfo();
  }, []);

  useEffect(() => {
    const loadConversationInfo = async () => {
      if (!conversationId || !currentUser) return;
      try {
        const response = await ConversationService.getConversationById(conversationId);
        if (response?.data) {
          let conversationTitle = response.data.title;
          
          if (response.data.type === 'DM') {
            const otherMember = response.data.members.find(
              member => member.user_id !== currentUser.user_id
            );
            if (otherMember) {
              conversationTitle = otherMember.full_name;
            }
          } else if (response.data.type === 'GROUP') {
            const memberNames = response.data.members
              .map(member => member.full_name)
              .join(', ');
            
            if (memberNames.length > 20) {
              conversationTitle = memberNames.substring(0, 20) + '...';
            } else {
              conversationTitle = memberNames;
            }
          }

          setConversationName(conversationTitle);
          navigation.setOptions({
            headerTitle: () => (
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {conversationTitle}
                </Text>
                {response.data.type === 'GROUP' && (
                  <Text style={styles.headerSubtitle}>
                    {response.data.members.length} members
                  </Text>
                )}
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity style={styles.headerRight}>
                <Image 
                  source={{ uri: response.data.avatar }} 
                  style={styles.headerAvatar}
                />
              </TouchableOpacity>
            ),
          });
        }
      } catch (error) {
        console.error('Error loading conversation info:', error);
      }
    };
    loadConversationInfo();
  }, [conversationId, navigation, currentUser]);

  const loadMessages = useCallback(async (shouldRefresh = false) => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const lastMessageId = shouldRefresh ? undefined : messages[messages.length - 1]?.message_id;
      const response = await ConversationService.getMessages(conversationId, lastMessageId);
      
      if (!response?.data) {
        setHasMore(false);
        return;
      }

      if (shouldRefresh) {
        setMessages(response.data);
      } else {
        setMessages(prev => [...prev, ...response.data]);
      }
      setHasMore(response.data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading messages:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [conversationId, messages]);

  useEffect(() => {
    if (conversationId) {
      loadMessages(true);
    }
  }, [conversationId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMessages(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || !currentUser) return;

    try {
      const response = await ConversationService.sendMessage({
        type: 'text',
        body: messageText.trim(),
        conversation_id: conversationId,
        user_online_id: "currentUser.user_online_id"
      });

      if (response?.data) {
        const msg = response.data;
        msg.user = {
          user_id: currentUser?.user_id,
          full_name: currentUser?.username,
          avatar: currentUser?.avatar || '',
        };
        setMessages(prev => [msg, ...prev]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = currentUser?.user_id === item.user.user_id;
    
    return (
      <View style={[
        styles.messageWrapper,
        isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper
      ]}>
        {!isMyMessage && (
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: item.user.avatar }} 
              style={styles.avatar}
            />
            <Text style={styles.userName}>{item.user.full_name}</Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>{item.body}</Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
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
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.message_id}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          inverted
          ListFooterComponent={
            loading && !refreshing ? (
              <ActivityIndicator style={styles.loader} color="#007AFF" />
            ) : null
          }
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={t('messages.typeMessage')}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <MaterialIcons name="send" size={24} color={messageText.trim() ? '#007AFF' : '#999'} />
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
  keyboardAvoidingView: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    padding: 16,
  },
  messageWrapper: {
    marginVertical: 8,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  userName: {
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
    marginLeft: '20%',
  },
  otherMessage: {
    backgroundColor: '#E5E5EA',
    borderTopLeftRadius: 4,
    marginRight: '20%',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: '#666',
  },
  loader: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    marginRight: 16,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default ConversationDetailScreen; 