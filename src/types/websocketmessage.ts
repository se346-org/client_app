export type WebSocketMessage = {
  type: string;
  payload: any;
  ignore_user_onlines?: string[];
};

export type MessageCallback = (message: WebSocketMessage) => void;
