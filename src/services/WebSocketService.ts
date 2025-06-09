import { WS_CONFIG } from "../config";
import { MessageCallback, WebSocketMessage } from "../types/websocketmessage";
import LoginService from "./LoginService";
import { AppState, AppStateStatus } from "react-native";

class EventEmitter {
  private events: { [key: string]: MessageCallback[] } = {};

  on(event: string, callback: MessageCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: MessageCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, data: WebSocketMessage) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(data));
  }
}

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private eventEmitter: EventEmitter;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private isConnecting = false;
  private appStateSubscription: any;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange
    );
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      // App has come to the foreground
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log("App came to foreground, reconnecting WebSocket...");
        this.connect();
      }
    } else if (nextAppState === "background" || nextAppState === "inactive") {
      // App has gone to the background
      console.log("App went to background, disconnecting WebSocket...");
      this.disconnect();
    }
  };

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public async connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    try {
      const token = await LoginService.getInstance().getToken();
      if (!token) {
        throw new Error("No token available");
      }

      this.ws = new WebSocket(`${WS_CONFIG.BASE_URL}/ws`);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        // Send authorization message
        this.sendMessage({
          type: "AUTHORIZATION",
          payload: {
            token: token,
          },
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.eventEmitter.emit("message", message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnecting = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => this.connect(), this.reconnectTimeout);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public cleanup() {
    this.disconnect();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  public sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
        this.handleReconnect();
        throw new Error(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
        );
      }
    } else {
      console.error("WebSocket is not connected");
      this.handleReconnect();
      throw new Error(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
      );
    }
  }

  public onMessage(callback: MessageCallback) {
    this.eventEmitter.on("message", callback);
  }

  public offMessage(callback: MessageCallback) {
    this.eventEmitter.off("message", callback);
  }
}

export default WebSocketService;
