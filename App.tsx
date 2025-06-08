import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import ConversationDetailScreen from './src/screens/ConversationDetailScreen';
import ContactScreen from './src/screens/ContactScreen';
import AccountScreen from './src/screens/AccountScreen';
import NewConversationScreen from './src/screens/NewConversationScreen';
import './src/i18n';
import { RootStackParamList } from './src/types/navigation';
import { navigationRef } from './src/services/NavigationService';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === 'Conversations') {
            iconName = 'chat';
          } else if (route.name === 'Contacts') {
            iconName = 'people';
          } else if (route.name === 'Account') {
            iconName = 'person';
          } else {
            iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Conversations" 
        component={ConversationScreen}
        options={{
          title: 'Chats',
        }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactScreen}
        options={{
          title: 'Contacts',
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          title: 'Account',
        }}
      />
    </Tab.Navigator>
  );
};

const LogoutButton = ({ navigation }: any) => (
  <TouchableOpacity 
    style={styles.logoutButton}
    onPress={() => navigation.navigate('Login')}
  >
    <Text style={styles.logoutText}>Logout</Text>
  </TouchableOpacity>
);

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="ConversationDetail" 
          component={ConversationDetailScreen}
          options={{
            headerShown: true,
            headerBackTitle: '',
            headerBackVisible: true,
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#fff',
            },
          }}
        />
        <Stack.Screen name="AddContact" component={ContactScreen} />
        <Stack.Screen name="NewChat" component={ConversationScreen} />
        <Stack.Screen 
          name="NewConversation" 
          component={NewConversationScreen}
          options={{
            headerShown: true,
            title: 'New Conversation',
            headerBackTitle: '',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontSize: 17,
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
