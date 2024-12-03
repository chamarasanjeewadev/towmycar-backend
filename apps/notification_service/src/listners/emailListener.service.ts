import { EventEmitter } from "events";
import {
  BaseNotificationType,
  DriverQuotedPayload,
  NotificationType,
  UserNotificationEventPayload,
  DriverNotificationEmailType,
} from "@towmycar/common";
import { sendEmail } from "../service/email.service";
import { NotificationRepository } from "../repository/notification.repository";

export function registerEmailListener(emitter: EventEmitter): void {
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationEmailType[]) => {
      const processPromises = payload.map(async payloadData => {
        try {
          const isAlreadySent = false;
          // await NotificationRepository.checkNotificationSent({
          //   userId: payloadData.driver.id,
          //   notificationType: NotificationType.DRIVER_NOTIFICATION,
          //   deliveryType: BaseNotificationType.EMAIL,
          //   breakdownRequestId: payloadData.breakdownRequestId.toString()
          // });

          if (isAlreadySent) {
            console.log(
              `Email already sent for driver: ${payloadData.driver.id}`
            );
            return;
          }

          await sendEmail(NotificationType.DRIVER_NOTIFICATION, payloadData);
        } catch (error) {
          console.error(
            `Failed to process email for driver ${payloadData.driver.id}:`,
            error
          );
        }
      });

      try {
        await Promise.allSettled(processPromises);
      } catch (error) {
        console.error("Error processing email notifications:", error);
      }
    }
  );

  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: UserNotificationEventPayload) => {
      // modify payload as push notification expects
    }
  );

  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTATION_UPDATED}`,
    async (payload: DriverQuotedPayload) => {
      await sendEmail(NotificationType.DRIVER_QUOTATION_UPDATED, payload);
      // modify payload as push notification expects
    }
  );

  // USER_REQUEST handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.USER_REQUEST}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.USER_REQUEST, payload);
      } catch (error) {
        console.error("Error sending USER_REQUEST email:", error);
      }
    }
  );

  // DRIVER_REGISTERED handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_REGISTERED}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.DRIVER_REGISTERED, payload);
      } catch (error) {
        console.error("Error sending DRIVER_REGISTERED email:", error);
      }
    }
  );

  // USER_CREATED handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.USER_CREATED}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.USER_CREATED, payload);
      } catch (error) {
        console.error("Error sending USER_CREATED email:", error);
      }
    }
  );

  // USER_ACCEPT handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.USER_ACCEPT}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.USER_ACCEPT, payload);
      } catch (error) {
        console.error("Error sending USER_ACCEPT email:", error);
      }
    }
  );

  // DRIVER_REJECT handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_REJECT}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.DRIVER_REJECT, payload);
      } catch (error) {
        console.error("Error sending DRIVER_REJECT email:", error);
      }
    }
  );

  // DRIVER_ASSIGNED handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_ASSIGNED}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.DRIVER_ASSIGNED, payload);
      } catch (error) {
        console.error("Error sending DRIVER_ASSIGNED email:", error);
      }
    }
  );

  // DRIVER_QUOTE handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTE}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.DRIVER_QUOTE, payload);
      } catch (error) {
        console.error("Error sending DRIVER_QUOTE email:", error);
      }
    }
  );

  // DRIVER_ACCEPT handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_ACCEPT}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.DRIVER_ACCEPT, payload);
      } catch (error) {
        console.error("Error sending DRIVER_ACCEPT email:", error);
      }
    }
  );

  // USER_REJECT handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.USER_REJECT}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.USER_REJECT, payload);
      } catch (error) {
        console.error("Error sending USER_REJECT email:", error);
      }
    }
  );

  // RATING_REVIEW handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.RATING_REVIEW}`,
    async (payload) => {
      try {
        await sendEmail(NotificationType.RATING_REVIEW, payload);
      } catch (error) {
        console.error("Error sending RATING_REVIEW email:", error);
      }
    }
  );
}
