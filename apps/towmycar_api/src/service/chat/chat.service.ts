import { ChatRepository } from "../../repository/chat.repository";
import { Chat, payments } from "@towmycar/database";
import { logger, mapToUserWithCustomer, mapToUserWithDriver, MessageSender, NotificationType, registerNotificationListener } from "@towmycar/common";
import EventEmitter from "events";
import {
  IDriverRepository,
  DriverRepository,
} from "../../repository/driver.repository";
import { VIEW_REQUEST_BASE_URL } from "../../config";
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

export const SendNewChatPushNotification = async ({driverId,requestId,sender}:{driverId:number,requestId:number,sender:MessageSender}) => {
  try{
 const result= await getChatBySenderRequestAndDriver(requestId,driverId,sender);
if(!result.length){
  const driverInfo = await DriverRepository.getSpecificDriverRequestWithInfo(
    driverId,
    requestId
  );
  const customerDetails = await DriverRepository.getCustomerByRequestId(
    requestId
  );

  const userWithDriver = mapToUserWithDriver(driverInfo);
  const userWithCustomer = mapToUserWithCustomer(customerDetails);
  const notificationEmitter = new EventEmitter()
 registerNotificationListener(notificationEmitter);
const viewRequestLink=sender===MessageSender.Driver?`${VIEW_REQUEST_BASE_URL}/user/requests/chat?requestId=${requestId}&driverId=${driverId}`:`${VIEW_REQUEST_BASE_URL}/driver/requests/chat?requestId=${requestId}`
 const notificationType=sender===MessageSender.Driver?NotificationType.DRIVER_CHAT_INITIATED:NotificationType.USER_CHAT_INITIATED
 const payload={
  driver:userWithDriver,user:userWithCustomer,breakdownRequestId:requestId,sender, 
  viewRequestLink
};
 notificationEmitter.emit(notificationType, payload);
}
}catch(error){
  logger.error("Error in sending new chat push notification:", error);
  console.log("Error in sending new chat push notification:", error);
}
}

export const getChatBySenderRequestAndDriver = async (
  requestId: number,driverId:number,sender:MessageSender
): Promise<Chat[]> => {
  try {
    return await ChatRepository.getChatBySenderRequestAndDriver(requestId,driverId,sender);
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
