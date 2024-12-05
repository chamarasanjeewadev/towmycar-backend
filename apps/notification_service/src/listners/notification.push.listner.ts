import { sendEmail } from "./../service/notification.email.service";
import { EventEmitter } from "events";
import {
  DeliveryNotificationType,
  NotificationPayload,
  NotificationType,
  DriverNotificationPayload,
  DriverQuotedPayload,
  ListnerPayload,
} from "@towmycar/common";
import { UserNotificationService } from "../service/notification.notification.service";
import { NotificationRepository } from "../repository/notification.repository";

async function processNotification(
  notificationType: NotificationType,
  payload: ListnerPayload
) {
  try {
    const isAlreadySent = await NotificationRepository.checkNotificationSent({
      userId: payload.sendToId,
      notificationType,
      deliveryType: DeliveryNotificationType.PUSH,
      breakdownRequestId: payload.breakdownRequestId,
    });

    if (isAlreadySent) {
      console.log(
        `Push notification already sent for user/driver: ${payload?.sendToId}, type: ${notificationType}`
      );
      return;
    }

    const pushPayload = UserNotificationService.generatePushNotificationPayload(
      notificationType,
      payload
    );

    const result = await UserNotificationService.sendPushNotification(
      notificationType,
      pushPayload
    );

    await NotificationRepository.saveNotification({
      userId: payload.sendToId,
      breakdownRequestId: payload.breakdownRequestId,
      baseNotificationType: DeliveryNotificationType.PUSH,
      deliveryType: DeliveryNotificationType.PUSH,
      notificationType: notificationType,
      payload: JSON.stringify(result),
      url: pushPayload.url,
      title: pushPayload.title,
      message: pushPayload.message,
    });
  } catch (error) {
    console.error(
      `Failed to process ${notificationType} notification for user/driver:`,
      error
    );
  }
}

export function registerPushNotificationListener(emitter: EventEmitter): void {
  // DRIVER_NOTIFICATION handler (array payload)
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload[]) => {
      const processPromises = payload.map(payloadData =>
        processNotification(NotificationType.DRIVER_NOTIFICATION, payloadData)
      );

      try {
        await Promise.allSettled(processPromises);
      } catch (error) {
        console.error("Error processing driver notifications:", error);
      }
    }
  );

  // USER_NOTIFICATION handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload) => {
      await processNotification(NotificationType.USER_NOTIFICATION, payload);
    }
  );

  // USER_REQUEST handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.USER_REQUEST}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.USER_REQUEST, payload);
    }
  );

  // DRIVER_REGISTERED handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.DRIVER_REGISTERED}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.DRIVER_REGISTERED, payload);
    }
  );

  // USER_CREATED handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.USER_CREATED}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.USER_CREATED, payload);
    }
  );

  // USER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.USER_ACCEPT}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.USER_ACCEPT, payload);
    }
  );

  // DRIVER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.DRIVER_REJECT}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.DRIVER_REJECT, payload);
    }
  );

  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.DRIVER_QUOTATION_UPDATED}`,
    async (payload: DriverQuotedPayload) => {
      await processNotification(
        NotificationType.DRIVER_QUOTATION_UPDATED,
        payload
      );
    }
  );

  // DRIVER_ASSIGNED handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.DRIVER_ASSIGNED}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.DRIVER_ASSIGNED, payload);
    }
  );

  // DRIVER_QUOTED handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.DRIVER_QUOTED}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.DRIVER_QUOTED, payload);
    }
  );

  // DRIVER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.DRIVER_ACCEPT}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.DRIVER_ACCEPT, payload);
    }
  );

  // USER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.USER_REJECT}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.USER_REJECT, payload);
    }
  );

  // RATING_REVIEW handler
  emitter.on(
    `${DeliveryNotificationType.PUSH}:${NotificationType.RATING_REVIEW}`,
    async (payload: NotificationPayload) => {
      await processNotification(NotificationType.RATING_REVIEW, payload);
    }
  );
}
