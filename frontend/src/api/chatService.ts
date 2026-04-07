import api from "./index";

export interface ChatRequest {
  message: string;
  language?: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

const chatService = {
  /**
   * Send a query to the legal chatbot
   * @param message The user's message
   * @param language The preferred language (defaults to English)
   */
  async sendQuery(message: string, language: string = "English"): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>("/api/chat/query", {
      message,
      language,
    });
    return response.data;
  },
};

export default chatService;
