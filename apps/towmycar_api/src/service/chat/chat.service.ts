import { ChatRepository } from "../../repository/chat.repository";
import { Chat } from "@towmycar/database";

export const getChatsForRequest = async (
  requestId: number
): Promise<Chat[]> => {
  try {
    return await ChatRepository.getChatsForRequest(requestId);
  } catch (error) {
    console.error("Error in getChatsForRequest:", error);
    throw new Error("Failed to retrieve chats for request");
  }
};

export const upsertChat = async (chatData: Partial<Chat>): Promise<Chat> => {
  try {
    return await ChatRepository.upsertChat(chatData);
  } catch (error) {
    console.error("Error in upsertChat:", error);
    throw new Error("Failed to upsert chat");
  }
};

export const getChatsForDriverAndRequest = async (
  driverId: number,
  requestId: number
): Promise<Chat[]> => {
  try {
    return await ChatRepository.getChatsForDriverAndRequest(
      driverId,
      requestId
    );
  } catch (error) {
    console.error("Error in getChatsForDriverAndRequest:", error);
    throw new Error("Failed to retrieve chats for driver and request");
  }
};

// Add more functions as needed
