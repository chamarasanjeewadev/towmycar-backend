//@ts-nocheck
import { DB, chats, Chat ,eq, and} from "@towmycar/database";

type ChatRepositoryType = {
  getChatsForRequest: (requestId: number) => Promise<Chat[]>;
  upsertChat: (chatData: Partial<Chat>) => Promise<Chat>;
  getChatsForDriverAndRequest: (
    driverId: number,
    requestId: number
  ) => Promise<Chat[]>;
};

export const ChatRepository: ChatRepositoryType = {
  async getChatsForRequest(requestId: number): Promise<Chat[]> {
    const result = await DB.select()
      .from(chats)
      .where(eq(chats.requestId, requestId))
      .orderBy(chats.sentAt);

    return result;
  },

  async upsertChat(chatData: Partial<Chat>): Promise<Chat> {
    const { id, ...data } = chatData;

    if (id) {
      // Update existing chat
      const [updatedChat] = await DB.update(chats)
        .set(data as Omit<Chat, "id">)
        .where(eq(chats.id, id))
        .returning();
      return updatedChat;
    } else {
      // Insert new chat
      const [newChat] = await DB.insert(chats)
        .values(data as Omit<Chat, "id">)
        .returning();
      return newChat;
    }
  },

  async getChatsForDriverAndRequest(
    driverId: number,
    requestId: number
  ): Promise<Chat[]> {
    const result = await DB.select()
      .from(chats)
      .where(and(eq(chats.driverId, driverId), eq(chats.requestId, requestId)))
      .orderBy(chats.sentAt);

    return result;
  },
};
