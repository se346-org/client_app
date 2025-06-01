import LoginService from "./LoginService";

export type WebSocketMessage = {
  type: string;
  payload: any;
  ignore_user_onlines?: string[];
};

type MessageCallback = (message: WebSocketMessage) => void;

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

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

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
      const token = await LoginService.getToken();
      if (!token) {
        throw new Error("No token available");
      }

      this.ws = new WebSocket("ws://localhost:8080/ws");

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

  public sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
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
