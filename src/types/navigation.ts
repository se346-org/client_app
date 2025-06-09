export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ConversationDetail: {
    conversationId: string;
    messageId?: string;
    senderId?: string;
    initialMessage?: {
      id: string;
      content: string;
      senderId: string;
      timestamp: string;
    };
  };
  AddContact: undefined;
  NewChat: undefined;
  NewConversation: undefined;
};
