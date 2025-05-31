export interface Conversation {
  conversation_id: string;
  title: string;
  avatar: string;
  last_message_id: string;
  created_at: string;
  updated_at: string;
  type: string;
  members: {
    user_id: string;
    full_name: string;
    avatar: string;
    user_type: string;
  }[];
  unreadCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

export interface ConversationResponse {
  data: Conversation[];
  message: string;
  status: number;
}

export interface GetConversationByIdResponse {
  data: Conversation;
  message: string;
  status: number;
}

// export interface GetConversationById {
//   conversation_id: string;
//   title: string;
//   avatar: string;
//   last_message_id: string;
//   created_at: string;
//   updated_at: string;
//   type: string;
//   members: {
//     user_id: string;
//     full_name: string;
//     avatar: string;
//     user_type: string;
//   }[];
// }
