import React from 'react';
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

interface Contact {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar?: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    status: 'online',
  },
  {
    id: '2',
    name: 'Jane Smith',
    status: 'offline',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    status: 'online',
  },
  {
    id: '4',
    name: 'Bob Wilson',
    status: 'offline',
  },
];

const ContactScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => navigation.navigate('Chat', { contactId: item.id })}
    >
      <View style={styles.avatar}>
        <Icon name="person" size={24} color="#666" />
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: item.status === 'online' ? '#4CAF50' : '#9E9E9E' },
          ]}
        />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>
          {item.status === 'online' ? t('contacts.online') : t('contacts.offline')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('contacts.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddContact')}
        >
          <Icon name="person-add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={mockContacts}
        renderItem={renderContact}
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
  addButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  contactItem: {
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
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
});

export default ContactScreen; 