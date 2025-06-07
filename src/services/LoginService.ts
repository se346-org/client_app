import { LoginRequest, LoginResponse } from "../types/auth";
import * as SecureStore from "expo-secure-store";
import HttpService from "./HttpService";
import { API_CONFIG } from "../config";
import WebSocketService from "./WebSocketService";
import FirebaseService from "./FirebaseService";
import NotificationService from "./NotificationService";

export const TOKEN_KEY = "auth_token";

class LoginService {
  private static instance: LoginService;
  private firebaseService: FirebaseService;
  private notificationService: NotificationService;

  private constructor() {
    this.firebaseService = FirebaseService.getInstance();
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
      console.log("Attempting login with data:", data);
      console.log("API URL:", `${API_CONFIG.BASE_URL}/user/login`);

      const loginData = await HttpService.post<LoginResponse>(
        "/user/login",
        data
      );
      console.log("Login response received:", loginData);

      // Extract access token from response
      const accessToken = loginData.data.access_token;
      if (!accessToken) {
        console.error("No access token in response");
        throw new Error("No access token received from server");
      }

      // Save token to SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      console.log("Token saved to SecureStore");

      // Connect WebSocket after successful login
      await WebSocketService.getInstance().connect();
      console.log("WebSocket connected");

      // Register FCM token after successful login
      const fcmToken = await this.firebaseService.getFCMToken();
      if (fcmToken) {
        await this.notificationService.registerFCMToken(fcmToken);
        console.log("FCM token registered");
      }

      return loginData;
    } catch (error) {
      console.error("Login error details:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
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

  async logout(): Promise<void> {
    try {
      // Get FCM token before logout
      const fcmToken = await this.firebaseService.getFCMToken();
      if (fcmToken) {
        await this.notificationService.unregisterFCMToken(fcmToken);
      }

      // Disconnect WebSocket before logout
      WebSocketService.getInstance().disconnect();
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
}

export default LoginService;
