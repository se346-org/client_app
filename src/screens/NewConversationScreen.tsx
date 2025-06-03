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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import ConversationService from '../services/ConversationService';
import UserService from '../services/UserService';
import StorageService from '../services/StorageService';
import { UserInfo } from '../types/user';

type RootStackParamList = {
  Main: undefined;
  Conversation: undefined;
  ConversationDetail: { conversationId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NewConversationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserInfo[]>([]);
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await StorageService.getUserInfo();
      if (user) {
        setCurrentUser(user);
      }
    };
    loadCurrentUser();
  }, []);

  const handleSearch = async () => {
    if (searchText.length > 0) {
      try {
        const response = await UserService.searchUsers(searchText);
        // Filter out duplicate users based on user_id
        const uniqueUsers = response.data.filter((user, index, self) =>
          index === self.findIndex((u) => u.user_id === user.user_id)
        );
        setSearchResults(uniqueUsers);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user: UserInfo) => {
    if (!selectedUsers.find(u => u.user_id === user.user_id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchText('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.user_id !== userId));
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0 || !messageText.trim() || !currentUser) return;

    try {
      const members = [...selectedUsers, currentUser];
      setLoading(true);
      // Create conversation first
      const conversationResponse = await ConversationService.createConversation({
        type: selectedUsers.length === 1 ? 'DM' : 'GROUP',
        members: members.map(user => user.user_id),
      });

      if (conversationResponse?.data) {
        // Send first message
        await ConversationService.sendMessage({
          type: 'text',
          body: messageText.trim(),
          conversation_id: conversationResponse.data.conversation_id,
          user_online_id: "currentUser.user_online_id"
        });

        // Replace current screen with ConversationDetail
        navigation.replace('ConversationDetail', { 
          conversationId: conversationResponse.data.conversation_id 
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedUser = ({ item }: { item: UserInfo }) => (
    <View style={styles.selectedUserItem}>
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
        style={styles.selectedUserAvatar}
      />
      <Text style={styles.selectedUserName}>{item.full_name}</Text>
      <TouchableOpacity
        onPress={() => handleRemoveUser(item.user_id)}
        style={styles.removeButton}
      >
        <MaterialIcons name="close" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: UserInfo }) => {
    // Check if user is already selected
    const isSelected = selectedUsers.some(user => user.user_id === item.user_id);
    
    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => handleSelectUser(item)}
        disabled={isSelected}
      >
        <Image
          source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
          style={styles.searchResultAvatar}
        />
        <Text style={styles.searchResultName}>{item.full_name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <MaterialIcons name="search" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults.filter(user => !selectedUsers.some(selected => selected.user_id === user.user_id))}
            renderItem={renderSearchResult}
            keyExtractor={item => `search-${item.user_id}`}
            style={styles.searchResultsList}
            contentContainerStyle={styles.searchResultsContent}
          />
        </View>
      )}

      <View style={styles.selectedUsersContainer}>
        <FlatList
          data={selectedUsers}
          renderItem={renderSelectedUser}
          keyExtractor={item => item.user_id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || selectedUsers.length === 0) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || selectedUsers.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MaterialIcons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    maxHeight: 300,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultsContent: {
    paddingHorizontal: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  searchResultName: {
    fontSize: 16,
    color: '#000',
  },
  selectedUsersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedUserName: {
    fontSize: 14,
    color: '#000',
    marginRight: 4,
  },
  removeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  messageInput: {
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
});

export default NewConversationScreen; 