export interface Message {
  message_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  conversation_id: string;
  type: string;
  user: {
    user_id: string;
    full_name: string;
    avatar: string;
  };
}

export interface MessageResponse {
  data: Message[];
  message: string;
  status: number;
}

export interface SendMessageResponse {
  data: Message;
  message: string;
  status: number;
}
