import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ToDoListScreen from './src/screens/ToDoListScreen';
import CreateToDoScreen from './src/screens/CreateToDoScreen';
import ToDoDetailScreen from './src/screens/ToDoDetailScreen';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
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
          name="Welcome" 
          component={WelcomeScreen}
          options={({ navigation }) => ({
            headerLeft: () => null,
            headerRight: () => <LogoutButton navigation={navigation} />
          })}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={({ navigation }) => ({
            headerLeft: () => null,
            headerRight: () => <LogoutButton navigation={navigation} />
          })}
        />
        <Stack.Screen 
          name="ToDoList" 
          component={ToDoListScreen}
          options={({ navigation }) => ({
            headerLeft: () => null,
            headerRight: () => <LogoutButton navigation={navigation} />
          })}
        />
        <Stack.Screen 
          name="CreateToDo" 
          component={CreateToDoScreen}
          options={({ navigation }) => ({
            headerLeft: () => null,
            headerRight: () => <LogoutButton navigation={navigation} />
          })}
        />
        <Stack.Screen 
          name="ToDoDetail" 
          component={ToDoDetailScreen}
          options={({ navigation }) => ({
            headerLeft: () => null,
            headerRight: () => <LogoutButton navigation={navigation} />
          })}
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
