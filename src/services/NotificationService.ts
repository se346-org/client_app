import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import PushNotification, {
  PushNotificationObject,
  ReceivedNotification,
} from "react-native-push-notification";
import { Platform } from "react-native";
import HttpService from "./HttpService";
import { NavigationService } from "./NavigationService";

const FCM_TOKEN_KEY = "fcm_token";

// Extend PushNotificationObject to include data property
interface ExtendedPushNotificationObject extends PushNotificationObject {
  data?: {
    conversationId?: string;
    [key: string]: any;
  };
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.configurePushNotification();
    this.setupNotificationHandlers();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private configurePushNotification() {
    // Configure notification channel for Android
    if (Platform.OS === "android") {
      PushNotification.createChannel(
        {
          channelId: "default",
          channelName: "Default Channel",
          channelDescription: "A default channel for notifications",
          playSound: true,
          soundName: "default",
          importance: 4, // High importance
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }

    // Configure notification handlers
    PushNotification.configure({
      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (
        notification: Omit<ReceivedNotification, "userInfo">
      ) {
        console.log("NOTIFICATION:", notification);

        // Handle notification click
        if (notification.userInteraction) {
          const data = notification.data as { conversationId?: string };
          if (data?.conversationId) {
            NavigationService.navigate("ConversationDetail", {
              conversationId: data.conversationId,
            });
          }
        }
      },

      // (optional) Called when Token is generated
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },

      // (optional) Called when the user fails to register for remote notifications
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // Request permissions on iOS
      requestPermissions: Platform.OS === "ios",
    });
  }

  private setupNotificationHandlers() {
    // Handle notification when app is in foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log("Received foreground message:", remoteMessage);
      // Display notification using react-native-push-notification
      PushNotification.localNotification({
        channelId: "default",
        title: remoteMessage.notification?.title || "New Message",
        message: remoteMessage.notification?.body || "",
        playSound: true,
        soundName: "default",
        importance: "high",
        priority: "high",
        data: remoteMessage.data, // Pass the data to handle navigation
      } as ExtendedPushNotificationObject);
    });

    // Handle notification when app is in background
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Received background message:", remoteMessage);
      // Display notification using react-native-push-notification
      PushNotification.localNotification({
        channelId: "default",
        title: remoteMessage.notification?.title || "New Message",
        message: remoteMessage.notification?.body || "",
        playSound: true,
        soundName: "default",
        importance: "high",
        priority: "high",
        data: remoteMessage.data, // Pass the data to handle navigation
      } as ExtendedPushNotificationObject);
    });
  }

  public async getFCMToken(): Promise<string | null> {
    try {
      // Check if we have a stored token
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (storedToken) {
        return storedToken;
      }

      // If no stored token, request permission and get new token
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("User notification permission denied");
        return null;
      }

      const token = await messaging().getToken();
      // Store the token
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  public async registerFCMToken(token: string): Promise<boolean> {
    try {
      await HttpService.post("/auth/fcm/token", { token });
      return true;
    } catch (error) {
      console.error("Error registering FCM token:", error);
      return false;
    }
  }

  public async unregisterFCMToken(): Promise<boolean> {
    try {
      // Get stored token
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (!token) {
        console.log("No FCM token found in storage");
        return true; // Consider this a success since there's no token to unregister
      }

      await HttpService.delete(`/fcm/token?fcm_token=${token}`);
      // Remove token from storage
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      return true;
    } catch (error) {
      console.error("Error unregistering FCM token:", error);
      return false;
    }
  }
}
