import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

class FirebaseService {
  private static instance: FirebaseService;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async requestUserPermission(): Promise<boolean> {
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
    return true;
  }

  public async getFCMToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) {
        console.log("User has no permission for notifications");
        return null;
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  public async onTokenRefresh(
    callback: (token: string) => void
  ): Promise<void> {
    messaging().onTokenRefresh(callback);
  }

  public async onMessage(callback: (message: any) => void): Promise<void> {
    messaging().onMessage(callback);
  }

  public async onNotificationOpenedApp(
    callback: (message: any) => void
  ): Promise<void> {
    messaging().onNotificationOpenedApp(callback);
  }

  public async getInitialNotification(): Promise<any> {
    return messaging().getInitialNotification();
  }
}

export default FirebaseService;
