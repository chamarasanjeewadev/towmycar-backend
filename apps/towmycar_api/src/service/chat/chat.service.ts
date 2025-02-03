import { ChatRepository } from "../../repository/chat.repository";
import { Chat } from "@towmycar/database";
import Pusher from "pusher";
import {
  BreakdownAssignmentDetails,
  CustomError,
  DriverStatus,
  emitNotificationEvent,
  ERROR_CODES,
  logger,
  mapToUserWithCustomer,
  mapToUserWithDriver,
  maskString,
  MessageSender,
  NotificationType,
  registerNotificationListener,
  UserStatus,
} from "@towmycar/common";
import EventEmitter from "events";
import { DriverRepository } from "../../repository/driver.repository";
import { VIEW_REQUEST_BASE_URL } from "../../config";
import { getViewRequestUrl } from "@towmycar/common/src/utils/view-request-url.utils";
import { BreakdownRequestRepository } from "../../repository/breakdownRequest.repository";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export const getChatsForRequest = async (
  requestId: number,
): Promise<Chat[]> => {
  try {
    return await ChatRepository.getChatsForRequest(requestId);
  } catch (error) {
    console.error("Error in getChatsForRequest:", error);
    throw new Error("Failed to retrieve chats for request");
  }
};

export const sendPusherMessage = async ({
  message,
  username,
  requestId,
  driverId,
  sender,
}: {
  message: string;
  username: string;
  requestId: number;
  driverId: number;
  sender: MessageSender;
}) => {
  try {
    //TODO cache this
    const assignment =
    await BreakdownRequestRepository.getBreakdownAssignmentsByDriverIdAndRequestId(driverId,
      requestId
    );
    if (!assignment||assignment.driverStatus === DriverStatus.CLOSED|| assignment.userStatus === UserStatus.CLOSED) {
      throw new CustomError(ERROR_CODES.CHAT_ASSIGNMENT_CLOSED, 403);
    }
    const pusherEventName =
      sender === MessageSender.Driver
        ? "user-chat-message"
        : "driver-chat-message";
    const maskedMessage = assignment?.driverStatus === DriverStatus.ACCEPTED ? message : maskString(message);

    // Trigger Pusher event
    await pusher.trigger(
      `breakdown-${requestId}-${driverId}`,
      pusherEventName,
      {
        username,
        message: maskedMessage,
        sender,
      },
    );
    await SendNewChatPushNotification({
      driverId,
      requestId,
      sender,
    });

    logger.info(
      `Message sent to channel: breakdown-${requestId}-${driverId}, Event: ${pusherEventName}`,
    );

    // Save the message to the database
    await upsertChat({
      requestId: requestId,
      driverId: driverId,
      message:maskedMessage,
      sender,
      sentAt: new Date(),
    });
  } catch (error) {
    logger.error("Error in sending new chat push notification:", error);
    console.log("Error in sending new chat push notification:", error);
    throw error;
  }
};

export const SendNewChatPushNotification = async ({
  driverId,
  requestId,
  sender,
}: {
  driverId: number;
  requestId: number;
  sender: MessageSender;
}) => {
  try {
    const result = await getChatBySenderRequestAndDriver(
      requestId,
      driverId,
      sender,
    );
    // if (!result.length) {
    const driverInfo = await DriverRepository.getSpecificDriverRequestWithInfo(
      driverId,
      requestId,
    );
    const customerDetails =
      await DriverRepository.getCustomerByRequestId(requestId);

    const userWithDriver = mapToUserWithDriver(driverInfo);
    const userWithCustomer = mapToUserWithCustomer(customerDetails);
    // const notificationEmitter = new EventEmitter();
    // registerNotificationListener(notificationEmitter);
    const notificationType =
      sender === MessageSender.Driver
        ? NotificationType.DRIVER_CHAT_INITIATED
        : NotificationType.USER_CHAT_INITIATED;
    const viewRequestLink = getViewRequestUrl(
      notificationType,
      VIEW_REQUEST_BASE_URL,
      {
        requestId,
        driverId,
      },
    );
    const payload = {
      driver: userWithDriver,
      user: userWithCustomer,
      breakdownRequestId: requestId,
      sender,
      viewRequestLink,
    };
    // notificationEmitter.emit(notificationType, payload);
    emitNotificationEvent(notificationType, payload);
    // }
  } catch (error) {
    logger.error("Error in sending new chat push notification:", error);
    console.log("Error in sending new chat push notification:", error);
  }
};

export const getChatBySenderRequestAndDriver = async (
  requestId: number,
  driverId: number,
  sender: MessageSender,
): Promise<Chat[]> => {
  try {
    return await ChatRepository.getChatBySenderRequestAndDriver(
      requestId,
      driverId,
      sender,
    );
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

export const getBreakdownAssignmentsByRequestId = async (
  requestId: number,
): Promise<BreakdownAssignmentDetails[]> => {
  const assignments =
    await BreakdownRequestRepository.getBreakdownAssignmentsByRequestId(
      requestId,
    );
  const filteredAssignments = assignments.filter(
    assignment =>
      assignment.driverStatus !== DriverStatus.CLOSED &&
      assignment.userStatus !== UserStatus.CLOSED,
  );
  return filteredAssignments;
};

export const getBreakdownAssignmentByRequestIdAndDriverId = async (driverId: number,
  requestId: number,
): Promise<BreakdownAssignmentDetails> => {
  const assignment =
    await BreakdownRequestRepository.getBreakdownAssignmentsByDriverIdAndRequestId(driverId,
      requestId
    );
  // const filteredAssignments = assignments.filter(
  //   assignment =>
  //     assignment.driverStatus !== DriverStatus.CLOSED &&
  //     assignment.userStatus !== UserStatus.CLOSED,
  // );
  return assignment;
};

export const getChatsForDriverAndRequest = async (
  driverId: number,
  requestId: number,
): Promise<Chat[]> => {
  try {
    return await ChatRepository.getChatsForDriverAndRequest(
      driverId,
      requestId,
    );
  } catch (error) {
    console.error("Error in getChatsForDriverAndRequest:", error);
    throw new Error("Failed to retrieve chats for driver and request");
  }
};

// Add more functions as needed
