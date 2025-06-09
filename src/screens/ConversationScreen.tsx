import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import ConversationService from '../services/ConversationService';
import { Conversation } from '../types/conversation';
import { formatDistanceToNow } from 'date-fns';
import StorageService from '../services/StorageService';
import { UserInfo } from '../types/user';
import WebSocketService from '../services/WebSocketService';
import { WebSocketMessage } from '../types/websocketmessage';
import { vi, enUS } from 'date-fns/locale';

const ITEMS_PER_PAGE = 20;

const ConversationScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const loadingRef = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await StorageService.getUserInfo();
      setCurrentUser(userInfo);
    };
    loadUserInfo();
  }, []);

  const getLastMessageId = useCallback(() => {
    if (conversations.length === 0) return undefined;
    return conversations[conversations.length - 1].last_message_id;
  }, [conversations]);

  const updateConversations = useCallback((newConversations: Conversation[], shouldRefresh: boolean) => {
    if (shouldRefresh) {
      setConversations(newConversations);
    } else {
      const existingIds = new Set(conversations.map(c => c.conversation_id));
      const uniqueNewConversations = newConversations.filter(c => !existingIds.has(c.conversation_id));
      setConversations(prev => [...prev, ...uniqueNewConversations]);
    }
    setHasMore(newConversations.length === ITEMS_PER_PAGE);
  }, [conversations]);

  const loadConversations = useCallback(async (shouldRefresh = false) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      const lastMessageId = shouldRefresh ? undefined : getLastMessageId();
      const response = await ConversationService.getConversations(lastMessageId);
      
      if (!response?.data) {
        setHasMore(false);
        return;
      }

      updateConversations(response.data, shouldRefresh);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false)
      loadingRef.current = false;
    }
  }, [getLastMessageId, updateConversations]);

  // Add AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to the foreground
      loadConversations(true);
    }
    appState.current = nextAppState;
  }, [loadConversations]);

  // Add navigation listener for screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only refresh if we're not already loading
      if (!loadingRef.current) {
        loadConversations(true);
      }
    });

    return unsubscribe;
  }, [navigation, loadConversations]);

  // Update WebSocket message handler
  useEffect(() => {
    const handleWebSocketMessage = async (message: WebSocketMessage) => {
      if (message.type === 'UPDATE_LAST_MESSAGE') {
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conversation => {
            if (conversation.conversation_id === message.payload.id) {
              return {
                ...conversation,
                last_message: {
                  ...message.payload.last_message,
                  message_id: message.payload.last_message.id,
                  user: {
                    user_id: message.payload.last_message.user_id,
                    full_name: message.payload.last_message.user.full_name,
                    user_type: message.payload.last_message.user.type
                  }
                },
                last_message_id: message.payload.last_message.id,
                updated_at: message.payload.last_message.created_at
              };
            }
            return conversation;
          });

          // Sort conversations by updated_at
          const sortedConversations = updatedConversations.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          return sortedConversations;
        });
      } else if (message.type === 'MESSAGE') {
        // Check if conversation exists in current state
        const conversationExists = conversations.some(
          conv => conv.conversation_id === message.payload.conversation_id
        );

        if (!conversationExists) {
          // If conversation doesn't exist, fetch latest conversations
          try {
            const response = await ConversationService.getConversations();
            if (response?.data) {
              setConversations(response.data);
            }
          } catch (error) {
            console.error('Error fetching conversations:', error);
          }
        } else {
          // If conversation exists, update it
          setConversations(prevConversations => {
            return prevConversations.map(conversation => {
              if (conversation.conversation_id === message.payload.conversation_id) {
                return {
                  ...conversation,
                  last_message: {
                    ...message.payload,
                    message_id: message.payload.id,
                    user: {
                      user_id: message.payload.user_id,
                      full_name: message.payload.user.full_name,
                      user_type: message.payload.user.type
                    }
                  },
                  last_message_id: message.payload.id,
                  updated_at: message.payload.created_at
                };
              }
              return conversation;
            }).sort((a, b) => 
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
          });
        }
      }
    };

    // Connect to WebSocket
    WebSocketService.getInstance().connect();
    WebSocketService.getInstance().onMessage(handleWebSocketMessage);

    return () => {
      WebSocketService.getInstance().offMessage(handleWebSocketMessage);
    };
  }, [conversations]);

  const getConversationTitle = (conversation: Conversation) => {
    if (!currentUser) return '';

    if (conversation.type === 'DM') {
      const otherMember = conversation.members.find(
        member => member.user_id !== currentUser.user_id
      );
      if (otherMember) {
        return otherMember.full_name;
      }
    } else if (conversation.type === 'GROUP') {
      const memberNames = conversation.members
        .map(member => member.full_name)
        .join(', ');
      
      if (memberNames.length > 20) {
        return memberNames.substring(0, 20) + '...';
      }
      return memberNames;
    }

    return '';
  };

  const handleConversationPress = async (conversation: Conversation) => {
    try {
      await ConversationService.markAsRead(conversation.conversation_id, conversation.last_message_id);
      navigation.navigate('ConversationDetail', { conversationId: conversation.conversation_id });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      navigation.navigate('ConversationDetail', { conversationId: conversation.conversation_id });
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !loadingRef.current) {
      loadConversations(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const locale = i18n.language === 'vi' ? vi : enUS;
    const distance = formatDistanceToNow(date, { 
      addSuffix: true,
      locale 
    });
    
    // Replace English text with translated text
    if (i18n.language === 'vi') {
      return distance
        .replace('about', 'khoảng')
        .replace('less than', 'chưa đến')
        .replace('over', 'hơn')
        .replace('almost', 'gần')
        .replace('minute', t('conversations.minutes'))
        .replace('hour', t('conversations.hours'))
        .replace('day', t('conversations.days'))
        .replace('week', t('conversations.weeks'))
        .replace('month', t('conversations.months'))
        .replace('year', t('conversations.years'))
        .replace('ago', t('conversations.timeAgo').replace('{{time}}', ''))
        .replace('just now', t('conversations.now'));
    }
    
    return distance;
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const isUnread = item.last_message && 
      !item.last_message.is_read && 
      item.last_message.user.user_id !== currentUser?.user_id;

    return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatarContainer}>
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialIcons name="person" size={24} color="#666" />
          </View>
          {isUnread && (
          <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>1</Text>
          </View>
        )}
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
            <Text style={[
              styles.name,
              isUnread && styles.unreadName
            ]}>
              {getConversationTitle(item)}
            </Text>
            {item.last_message && (
            <Text style={styles.time}>
                {formatTimeAgo(new Date(item.last_message.created_at))}
            </Text>
          )}
        </View>
          {item.last_message && (
            <Text 
              style={[
                styles.lastMessage,
                isUnread && styles.unreadMessage
              ]} 
              numberOfLines={1}
            >
              {item.last_message.body}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('NewConversation')}
          style={{ marginRight: 16 }}
        >
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('conversations.title')}</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => navigation.navigate('NewConversation')}
        >
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.conversation_id}
        contentContainerStyle={styles.list}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator style={styles.loader} color="#007AFF" />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  list: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    padding: 16,
  },
  newChatButton: {
    padding: 8,
  },
  unreadName: {
    fontWeight: 'bold',
    color: '#000',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#000',
  },
});

export default ConversationScreen; 