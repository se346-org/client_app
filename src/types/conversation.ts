export interface Conversation {
  conversation_id: string;
  last_message_id: string;
  created_at: string;
  updated_at: string;
  type: string;
  last_message: {
    message_id: string;
    body: string;
    created_at: string;
    updated_at: string;
    conversation_id: string;
    user: {
      user_id: string;
      full_name: string;
      user_type: string;
    };
    type: string;
    is_read: boolean;
  };
  members: {
    user_id: string;
    full_name: string;
    user_type: string;
  }[];
  unreadCount?: number;
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
