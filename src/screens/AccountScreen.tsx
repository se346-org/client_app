import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from '../services/LoginService';
import StorageService from '../services/StorageService';
import { UserInfo } from '../types/user';

const AccountScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const info = await StorageService.getUserInfo();
        setUserInfo(info);
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {userInfo?.avatar ? (
              <Image 
                source={{ uri: userInfo.avatar }} 
                style={styles.avatar}
                defaultSource={require('../../assets/default-avatar.png')}
              />
            ) : (
              <Image 
                source={require('../../assets/default-avatar.png')}
                style={styles.avatar}
              />
            )}
          </View>
          <Text style={styles.name}>{userInfo?.full_name || ''}</Text>
          <Text style={styles.email}>{userInfo?.email || ''}</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="person-outline" size={24} color="#666" />
            <Text style={styles.menuText}>{t('account.editProfile')}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="notifications-none" size={24} color="#666" />
            <Text style={styles.menuText}>{t('account.notifications')}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="security" size={24} color="#666" />
            <Text style={styles.menuText}>{t('account.security')}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Button
            title={t('account.logout')}
            onPress={handleLogout}
            icon="logout"
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 15,
  },
  deleteButton: {
    marginTop: 10,
  },
});

export default AccountScreen; 