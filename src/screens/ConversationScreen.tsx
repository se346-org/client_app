import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import ConversationService, { Conversation } from '../services/ConversationService';
import { formatDistanceToNow } from 'date-fns';

const ITEMS_PER_PAGE = 20;

const ConversationScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
    try {
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
      setRefreshing(false);
    }
  }, [getLastMessageId, updateConversations]);

  const handleConversationPress = async (conversation: Conversation) => {
    try {
      await ConversationService.markAsRead(conversation.conversation_id);
      navigation.navigate('Chat', { conversationId: conversation.conversation_id });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      navigation.navigate('Chat', { conversationId: conversation.conversation_id });
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadConversations(false);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialIcons name="person" size={24} color="#666" />
          </View>
        )}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.name}>{item.conversation_id}</Text>
          {item.lastMessage && (
            <Text style={styles.time}>
              {formatDistanceToNow(new Date(item.lastMessage.createdAt), { addSuffix: true })}
            </Text>
          )}
        </View>
        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('conversations.title')}</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => navigation.navigate('NewChat')}
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
        onMomentumScrollEnd={handleLoadMore}
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
  newChatButton: {
    padding: 8,
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
});

export default ConversationScreen; 