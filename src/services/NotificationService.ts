import { AppState, Platform } from "react-native";
import HttpService from "./HttpService";
import FirebaseService from "./FirebaseService";
import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

class NotificationService {
  private static instance: NotificationService;
  private httpService: typeof HttpService;
  private firebaseService: typeof FirebaseService;
  private appState: AppState["currentState"] = AppState.currentState;

  private constructor() {
    this.httpService = HttpService;
    this.firebaseService = FirebaseService;
    this.setupNotificationListeners();
    this.setupAppStateListener();
    this.setupNotifeeListeners();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async setupNotificationListeners() {
    // Xử lý thông báo khi app ở background
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
      // Thông báo sẽ tự động hiển thị khi app ở background
    });

    // Xử lý thông báo khi app ở foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log("Received foreground message:", remoteMessage);

      if (Platform.OS === "android") {
        // Tạo notification channel cho Android
        await notifee.createChannel({
          id: "default",
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
          vibration: true,
          sound: "default",
        });

        // Hiển thị thông báo
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || "New Message",
          body: remoteMessage.notification?.body || "",
          data: remoteMessage.data, // Lưu data để xử lý khi click
          android: {
            channelId: "default",
            importance: AndroidImportance.HIGH,
            sound: "default",
            smallIcon: "ic_notification",
            pressAction: {
              id: "default",
              launchActivity: "default",
            },
          },
        });
      }
    });

    // Xử lý khi app được mở từ background hoặc quit state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("App opened from background state:", remoteMessage);
      this.handleNotificationClick(remoteMessage);
    });

    // Kiểm tra xem app có được mở từ quit state không
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("App opened from quit state:", remoteMessage);
          this.handleNotificationClick(remoteMessage);
        }
      });
  }

  private setupNotifeeListeners() {
    // Xử lý khi click vào notification
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log("User pressed notification", detail.notification);
        this.handleNotificationClick(detail.notification);
      }
    });

    // Xử lý khi click vào notification khi app ở background
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log("User pressed notification", detail.notification);
        this.handleNotificationClick(detail.notification);
      }
    });
  }

  private handleNotificationClick(notification: any) {
    const data = notification.data;
    if (data?.conversationId) {
      // Sử dụng navigation từ App.tsx
      const navigation = require("../App").navigation;
      if (navigation) {
        navigation.navigate("Conversation", {
          conversationId: data.conversationId,
          messageId: data.messageId,
          senderId: data.senderId,
        });
      }
    }
  }

  private setupAppStateListener() {
    AppState.addEventListener("change", (nextAppState) => {
      if (
        this.appState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
      }
      this.appState = nextAppState;
    });
  }

  public async requestPermissions() {
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
      }
    }
  }

  public async getFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log("FCM Token:", fcmToken);
        return fcmToken;
      }
    } catch (error) {
      console.error("Failed to get FCM token:", error);
    }
    return null;
  }

  public async onTokenRefresh() {
    messaging().onTokenRefresh(async (fcmToken) => {
      console.log("New FCM Token:", fcmToken);
      // TODO: Gửi token mới lên server
    });
  }
}

export default NotificationService;
