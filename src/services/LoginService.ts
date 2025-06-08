import { LoginRequest, LoginResponse } from "../types/auth";
import * as SecureStore from "expo-secure-store";
import HttpService from "./HttpService";
import WebSocketService from "./WebSocketService";
import { NotificationService } from "./NotificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOKEN_KEY = "auth_token";

class LoginService {
  private static instance: LoginService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): LoginService {
    if (!LoginService.instance) {
      LoginService.instance = new LoginService();
    }
    return LoginService.instance;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const loginData = await HttpService.post<LoginResponse>(
        "/user/login",
        data
      );

      // Extract access token from response
      const accessToken = loginData.data.access_token;
      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      // Save token to SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      console.log("Token saved to SecureStore");

      // Connect WebSocket after successful login
      await WebSocketService.getInstance().connect();
      console.log("WebSocket connected");

      // Register FCM token after successful login
      const fcmToken = await this.notificationService.getFCMToken();
      if (fcmToken) {
        await this.notificationService.registerFCMToken(fcmToken);
        console.log("FCM token registered");
      }

      return loginData;
    } catch (error) {
      console.error("Login error details:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token from SecureStore:", error);
      return null;
    }
  }

  public async logout() {
    try {
      await this.notificationService.unregisterFCMToken();

      // Clear auth token
      await AsyncStorage.removeItem("auth_token");
      // Clear user data
      await AsyncStorage.removeItem("user_data");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }
}

export default LoginService;
