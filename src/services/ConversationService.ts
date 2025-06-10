import {
  ConversationResponse,
  GetConversationByIdResponse,
  Conversation,
} from "../types/conversation";
import {
  MessageResponse,
  Message,
  SendMessageResponse,
} from "../types/message";
import HttpService from "./HttpService";

interface SendMessageRequest {
  type: string;
  body: string;
  conversation_id: string;
  user_online_id: string;
}

interface CreateConversationRequest {
  type: string;
  members: string[];
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

  async getConversationById(
    conversationId: string
  ): Promise<GetConversationByIdResponse> {
    try {
      return await HttpService.get<GetConversationByIdResponse>(
        `/auth/conversation?conversation_id=${conversationId}`
      );
    } catch (error) {
      console.error("Error getting conversation by id:", error);
      throw error;
    }
  }

  async createConversation(
    data: CreateConversationRequest
  ): Promise<GetConversationByIdResponse> {
    try {
      return await HttpService.post<GetConversationByIdResponse>(
        "/auth/conversation",
        data
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async markAsRead(conversationId: string, messageId: string): Promise<void> {
    try {
      await HttpService.post(`/auth/seen-message`, {
        message_id: messageId,
        conversation_id: conversationId,
      });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  }

  async getMessages(
    conversationId: string,
    lastMessageId?: string
  ): Promise<MessageResponse> {
    try {
      return await HttpService.get<MessageResponse>(
        `/auth/message?conversation_id=${conversationId}&last_message_id=${lastMessageId}`
      );
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        return await HttpService.post<SendMessageResponse>(
          "/auth/message",
          data
        );
      } catch (error) {
        console.error(
          `Error sending message (attempt ${retryCount + 1}/${maxRetries}):`,
          error
        );
        retryCount++;

        if (retryCount === maxRetries) {
          throw new Error(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
          );
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    throw new Error(
      "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
    );
  }
}

export default new ConversationService();
