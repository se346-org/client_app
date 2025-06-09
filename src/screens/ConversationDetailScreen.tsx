import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ConversationService from '../services/ConversationService';
import StorageService from '../services/StorageService';
import WebSocketService from '../services/WebSocketService';
import { WebSocketMessage } from '../types/websocketmessage';
import { Message } from '../types/message';

const ConversationDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { conversationId } = route.params as { conversationId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [wsService] = useState(() => WebSocketService.getInstance());
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<View>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

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
        // Sort messages by created_at in descending order (newest first)
        const sortedMessages = response.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setMessages(sortedMessages);
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
        // Map WebSocket message to Message interface
        const mappedMessage: Message = {
          message_id: message.payload.id,
          body: message.payload.body,
          type: message.payload.type,
          created_at: message.payload.created_at,
          updated_at: message.payload.updated_at,
          conversation_id: message.payload.conversation_id,
          user: {
            user_id: message.payload.user_id,
            full_name: message.payload.user.full_name,
            avatar: message.payload.user.avatar || 'https://via.placeholder.com/40'
          }
        };
        // Add new message to the beginning of the list
        setMessages(prevMessages => [mappedMessage, ...prevMessages]);
      }
    };

    wsService.onMessage(handleMessage);

    return () => {
      wsService.offMessage(handleMessage);
    };
  }, [conversationId, wsService]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await ConversationService.getConversationById(conversationId);
        if (response?.data) {
          setConversation(response.data);
          // Set title based on conversation type
          if (response.data.type === 'DM') {
            // For DM, show other user's name
            const otherUser = response.data.members.find(m => m.user_id !== currentUser?.user_id);
            if (otherUser) {
              navigation.setOptions({
                title: otherUser.full_name,
                headerRight: () => (
                  <TouchableOpacity
                    ref={menuButtonRef}
                    onPress={handleMenuPress}
                    style={styles.menuButton}
                  >
                    <MaterialIcons name="more-vert" size={24} color="#007AFF" />
                  </TouchableOpacity>
                ),
              });
            }
          } else {
            // For group, combine member names
            const memberNames = response.data.members
              .map(member => member.full_name)
              .join(', ');
            navigation.setOptions({
              title: memberNames || 'Group Chat',
              headerRight: () => (
                <TouchableOpacity
                  ref={menuButtonRef}
                  onPress={handleMenuPress}
                  style={styles.menuButton}
                >
                  <MaterialIcons name="more-vert" size={24} color="#007AFF" />
                </TouchableOpacity>
              ),
            });
          }
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchConversation();
  }, [conversationId, currentUser, navigation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    try {
      setLoading(true);
      await ConversationService.sendMessage({
        type: 'text',
        body: messageText.trim(),
        conversation_id: conversationId,
        user_online_id: "currentUser.user_online_id"
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!conversation || !currentUser) return;

    Alert.alert(
      t('conversation.menu.leaveGroup'),
      t('conversation.menu.leaveGroupConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await ConversationService.leaveGroup(conversationId);
              navigation.goBack();
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert(t('conversation.error.leaveGroup'));
            }
          }
        }
      ]
    );
  };

  const handleViewMembers = () => {
    setShowMembers(true);
    setShowMenu(false);
  };

  const renderMemberItem = ({ item }: { item: any }) => (
    <View style={styles.memberItem}>
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
        style={styles.memberAvatar}
      />
      <Text style={styles.memberName}>{item.full_name}</Text>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = String(item.user?.user_id) === String(currentUser?.user_id);

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

  // Combine messages from API and WebSocket
  const allMessages = [...messages, ...wsMessages];

  const handleMenuPress = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        const screenWidth = Dimensions.get('window').width;
        const menuWidth = 200; // Width of the menu
        
        // Calculate position to show menu on the right side of the button
        let menuX = pageX - menuWidth + width;
        
        // If menu would go off screen to the right, align it to the right edge
        if (menuX + menuWidth > screenWidth) {
          menuX = screenWidth - menuWidth - 16; // 16px padding from screen edge
        }
        
        // If menu would go off screen to the left, align it to the left edge
        if (menuX < 16) {
          menuX = 16;
        }

        setMenuPosition({
          x: menuX,
          y: pageY + height + 5, // Add some padding below the button
        });
        setShowMenu(true);
      });
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const results = messages.filter(message => 
      message.body.toLowerCase().includes(searchText.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleSearchPress = () => {
    setShowMenu(false);
    setShowSearch(true);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchText('');
    setSearchResults([]);
  };

  const handleViewGroupInfo = () => {
    setShowMenu(false);
    // TODO: Implement group info screen
    Alert.alert('Coming soon', 'Group info feature will be available soon');
  };

  const handleMuteNotifications = () => {
    setShowMenu(false);
    // TODO: Implement mute notifications
    Alert.alert('Coming soon', 'Mute notifications feature will be available soon');
  };

  const handleClearChat = () => {
    setShowMenu(false);
    Alert.alert(
      t('conversation.menu.clearChat'),
      t('conversation.menu.clearChatConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement clear chat
              Alert.alert('Coming soon', 'Clear chat feature will be available soon');
            } catch (error) {
              console.error('Error clearing chat:', error);
              Alert.alert(t('conversation.error.clearChat'));
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {showSearch ? (
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <TouchableOpacity
                onPress={handleSearchClose}
                style={styles.searchBackButton}
              >
                <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder={t('conversation.search.placeholder')}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.searchClearButton}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={searchResults}
              renderItem={renderMessage}
              keyExtractor={item => item.message_id || `${item.created_at}-${item.user?.user_id}`}
              contentContainerStyle={styles.searchResults}
            />
          </View>
        ) : (
          <>
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
                inverted={true}
                ref={flatListRef}
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
          </>
        )}
      </KeyboardAvoidingView>

      {/* Menu Overlay */}
      {showMenu && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[
              styles.menuContainer,
              {
                position: 'absolute',
                top: menuPosition.y,
                left: menuPosition.x,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSearchPress}
            >
              <MaterialIcons name="search" size={24} color="#000" />
              <Text style={styles.menuItemText}>{t('conversation.menu.search')}</Text>
            </TouchableOpacity>

            {conversation?.type === 'GROUP' && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleViewGroupInfo}
                >
                  <MaterialIcons name="info" size={24} color="#000" />
                  <Text style={styles.menuItemText}>{t('conversation.menu.groupInfo')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    setShowMembers(true);
                  }}
                >
                  <MaterialIcons name="people" size={24} color="#000" />
                  <Text style={styles.menuItemText}>{t('conversation.menu.viewMembers')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleMuteNotifications}
                >
                  <MaterialIcons name="notifications-off" size={24} color="#000" />
                  <Text style={styles.menuItemText}>{t('conversation.menu.muteNotifications')}</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleClearChat}
            >
              <MaterialIcons name="delete" size={24} color="#FF3B30" />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                {t('conversation.menu.clearChat')}
              </Text>
            </TouchableOpacity>

            {conversation?.type === 'GROUP' && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  handleLeaveGroup();
                }}
              >
                <MaterialIcons name="exit-to-app" size={24} color="#FF3B30" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                  {t('conversation.menu.leaveGroup')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Members Modal */}
      <Modal
        visible={showMembers}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMembers(false)}
      >
        <View style={styles.membersModalContainer}>
          <View style={styles.membersModalContent}>
            <View style={styles.membersModalHeader}>
              <Text style={styles.membersModalTitle}>{t('conversation.members.title')}</Text>
              <TouchableOpacity
                onPress={() => setShowMembers(false)}
                style={styles.membersModalClose}
              >
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={conversation?.members || []}
              renderItem={renderMemberItem}
              keyExtractor={item => item.user_id}
              contentContainerStyle={styles.membersList}
            />
          </View>
        </View>
      </Modal>
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
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  menuItemTextDanger: {
    color: '#FF3B30',
  },
  membersModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  membersModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '80%',
  },
  membersModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  membersModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  membersModalClose: {
    padding: 8,
  },
  membersList: {
    paddingBottom: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    color: '#000',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBackButton: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    fontSize: 16,
  },
  searchClearButton: {
    padding: 8,
  },
  searchResults: {
    padding: 16,
  },
});

export default ConversationDetailScreen; 