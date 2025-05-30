import HttpService from "./HttpService";

export interface Conversation {
  last_message_id: string;
  conversation_id: string;
  id: string;
  name: string;
  avatar: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

export interface ConversationResponse {
  data: Conversation[];
  message: string;
}

class ConversationService {
  async getConversations(
    last_message_id?: string
  ): Promise<ConversationResponse> {
    try {
      return await HttpService.get<ConversationResponse>(`/auth/conversation`, {
        last_message_id,
      });
    } catch (error) {
      console.error("Error getting conversations:", error);
      throw error;
    }
  }

  async getLastMessages(): Promise<ConversationResponse> {
    try {
      return await HttpService.get<ConversationResponse>(
        "/conversation/last-messages"
      );
    } catch (error) {
      console.error("Error getting last messages:", error);
      throw error;
    }
  }

  async createConversation(userId: string): Promise<ConversationResponse> {
    try {
      return await HttpService.post<ConversationResponse>("/conversation", {
        userId,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await HttpService.delete(`/conversation/${conversationId}`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    try {
      await HttpService.put(`/conversation/${conversationId}/read`);
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  }
}

export default new ConversationService();
