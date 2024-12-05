import { EventEmitter } from "events";
import {
  DeliveryNotificationType,
  NotificationPayload,
  NotificationType,
  DriverNotificationPayload,
  UserNotificationPayload,
  ListnerPayload,
} from "@towmycar/common";
import { SMSNotificationService } from "../service/notification.sms.service";
import { NotificationRepository } from "../repository/notification.repository";

async function processSMSNotification(
  notificationType: NotificationType,
  payload: ListnerPayload
) {
  try {
    const userId = payload.sendToId;

    const isAlreadySent = await NotificationRepository.checkNotificationSent({
      userId,
      notificationType,
      deliveryType: DeliveryNotificationType.SMS,
      breakdownRequestId: payload.breakdownRequestId,
    });

    if (isAlreadySent) {
      console.log(
        `SMS notification already sent for user/driver: ${userId}, type: ${notificationType}`
      );
      return;
    }

    const smsPayload = SMSNotificationService.generateSMSNotificationPayload(
      notificationType,
      payload
    );

    await SMSNotificationService.sendSMSNotification(notificationType, payload);

    await NotificationRepository.saveNotification({
      userId: payload.sendToId,
      breakdownRequestId: payload.breakdownRequestId,
      baseNotificationType: DeliveryNotificationType.SMS,
      deliveryType: DeliveryNotificationType.SMS,
      notificationType: notificationType,
      payload: JSON.stringify(payload),
      url: smsPayload.viewLink,
      title: notificationType,
      message: smsPayload.message,
    });

    console.log(`SMS notification sent successfully to ${userId}`);
  } catch (error) {
    console.error(
      `Failed to process ${notificationType} SMS notification for user/driver:`,
      error
    );
  }
}

export function registerSmsNotificationListener(emitter: EventEmitter): void {
  // DRIVER_NOTIFICATION handler (array payload)
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload[]) => {
      const processPromises = payload.map(payloadData =>
        processSMSNotification(
          NotificationType.DRIVER_NOTIFICATION,
          payloadData
        )
      );

      try {
        await Promise.allSettled(processPromises);
      } catch (error) {
        console.error("Error processing SMS notifications:", error);
      }
    }
  );

  // USER_NOTIFICATION handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: UserNotificationPayload) => {
      await processSMSNotification(NotificationType.USER_NOTIFICATION, payload);
    }
  );

  // USER_REQUEST handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.USER_REQUEST}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.USER_REQUEST, payload);
    }
  );

  // DRIVER_REGISTERED handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.DRIVER_REGISTERED}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.DRIVER_REGISTERED, payload);
    }
  );

  // USER_CREATED handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.USER_CREATED}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.USER_CREATED, payload);
    }
  );

  // USER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.USER_ACCEPT}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.USER_ACCEPT, payload);
    }
  );

  // DRIVER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.DRIVER_REJECT}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.DRIVER_REJECT, payload);
    }
  );

  // DRIVER_QUOTATION_UPDATED handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.DRIVER_QUOTATION_UPDATED}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(
        NotificationType.DRIVER_QUOTATION_UPDATED,
        payload
      );
    }
  );

  // DRIVER_ASSIGNED handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.DRIVER_ASSIGNED}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.DRIVER_ASSIGNED, payload);
    }
  );

  // DRIVER_QUOTED handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.DRIVER_QUOTED}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.DRIVER_QUOTED, payload);
    }
  );

  // DRIVER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.DRIVER_ACCEPT}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.DRIVER_ACCEPT, payload);
    }
  );

  // USER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.USER_REJECT}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.USER_REJECT, payload);
    }
  );

  // RATING_REVIEW handler
  emitter.on(
    `${DeliveryNotificationType.SMS}:${NotificationType.RATING_REVIEW}`,
    async (payload: NotificationPayload) => {
      await processSMSNotification(NotificationType.RATING_REVIEW, payload);
    }
  );
}