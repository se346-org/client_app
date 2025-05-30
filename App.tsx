import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import React from 'react';
import RegisterScreen from './src/screens/RegisterScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: { username: string };
  ForgotPassword: { username: string };
  ToDoList: { username: string };
  CreateToDo: { username: string };
  ToDoDetail: { username: string, toDoId: string };
}

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }}
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
