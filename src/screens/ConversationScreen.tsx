import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TabBar from '../components/TabBar';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  type: 'direct' | 'group';
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hey, how are you?',
    timestamp: '10:30 AM',
    unreadCount: 2,
    type: 'direct',
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'See you tomorrow!',
    timestamp: 'Yesterday',
    unreadCount: 0,
    type: 'direct',
  },
  {
    id: '3',
    name: 'Team Meeting',
    lastMessage: 'Alice: Let\'s discuss the project',
    timestamp: 'Yesterday',
    unreadCount: 5,
    type: 'group',
  },
  {
    id: '4',
    name: 'Project Updates',
    lastMessage: 'Bob: New features deployed',
    timestamp: '2 days ago',
    unreadCount: 3,
    type: 'group',
  },
];

const ConversationScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ['All', 'Unread', 'Groups'];

  const filteredConversations = useMemo(() => {
    switch (activeTab) {
      case 1: // Unread
        return mockConversations.filter(conv => conv.unreadCount > 0);
      case 2: // Groups
        return mockConversations.filter(conv => conv.type === 'group');
      default: // All
        return mockConversations;
    }
  }, [activeTab]);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
    >
      <View style={styles.avatar}>
        <Icon 
          name={item.type === 'group' ? 'group' : 'person'} 
          size={24} 
          color="#666" 
        />
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
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
          <Icon name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newChatButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ConversationScreen; 