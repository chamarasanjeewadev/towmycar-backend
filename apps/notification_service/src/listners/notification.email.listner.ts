import { EventEmitter } from "events";
import {
  BaseNotificationType,
  DriverQuotedEventPayload,
  NotificationType,
  UserNotificationEventPayload,
  DriverNotificationPayload,
  UserNotificationNotificationpayload as UserNotificationEmailPayload,
  UserNotificationNotificationpayload,
  EmailPayloadType,
  UserNotificationPayload,
  DriverQuotedPayload,
} from "@towmycar/common";
import {
  getEmailContent,
  sendEmail,
} from "../service/notification.email.service";
import { NotificationRepository } from "repository/notification.repository";

export function registerEmailListener(emitter: EventEmitter): void {
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload[]) => {
      const processPromises = payload.map(async payload => {
        try {
          const isAlreadySent = false;
          await NotificationRepository.checkNotificationSent({
            userId: payload.driver.userId,
            notificationType: NotificationType.DRIVER_NOTIFICATION,
            deliveryType: BaseNotificationType.EMAIL,
            breakdownRequestId: payload.breakdownRequestId.toString(),
          });

          if (isAlreadySent) {
            console.log(
              `Email already sent for driver: ${payload.driver.userId}`
            );
            return;
          }
          const emailContent = getEmailContent(
            NotificationType.USER_NOTIFICATION,
            payload
          );
          await NotificationRepository.saveNotification({
            userId: payload?.driver?.userId,
            breakdownRequestId: payload.breakdownRequestId,
            title: emailContent.subject,
            message: emailContent.htmlBody,
            baseNotificationType: BaseNotificationType.EMAIL,
            notificationType: NotificationType.USER_NOTIFICATION.toString(),
            payload: JSON.stringify(payload),
            url: payload.viewRequestLink,
          });
          const emailPayloadType: EmailPayloadType = {
            recipientEmail: payload.driver?.email,
            subject: emailContent.subject,
            htmlBody: emailContent.htmlBody,
          };

          await sendEmail(
            NotificationType.DRIVER_NOTIFICATION,
            emailPayloadType
          );
        } catch (error) {
          console.error(
            `Failed to process email for driver ${payload.driver.userId}:`,
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
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_NOTIFICATION,
        payload
      );
      const isAlreadySent = false;
      await NotificationRepository.checkNotificationSent({
        userId: payload.driver.userId,
        notificationType: NotificationType.USER_NOTIFICATION,
        deliveryType: BaseNotificationType.EMAIL,
        breakdownRequestId: payload.breakdownRequestId.toString(),
      });

      if (isAlreadySent) {
        console.log(`Email already sent for driver: ${payload.driver.userId}`);
        return;
      }
      await NotificationRepository.saveNotification({
        userId: payload?.driver?.userId,
        breakdownRequestId: payload.breakdownRequestId,
        title: emailContent.subject,
        message: emailContent.htmlBody,
        baseNotificationType: BaseNotificationType.EMAIL,
        notificationType: NotificationType.USER_NOTIFICATION.toString(),
        payload: JSON.stringify(payload),
        url: payload.viewRequestLink,
      });
      const emailPayloadType: EmailPayloadType = {
        recipientEmail: payload.user?.email,
        subject: emailContent.subject,
        htmlBody: emailContent.htmlBody,
      };

      await sendEmail(NotificationType.USER_NOTIFICATION, emailPayloadType);
    }
  );
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTED}`,
    async (payload: DriverQuotedPayload) => {
      const isAlreadySent = false;
      await NotificationRepository.checkNotificationSent({
        userId: payload.driver.userId,
        notificationType: NotificationType.DRIVER_QUOTED,
        deliveryType: BaseNotificationType.EMAIL,
        breakdownRequestId: payload.breakdownRequestId.toString(),
      });

      if (isAlreadySent) {
        console.log(`Email already sent for driver: ${payload.driver.userId}`);
        return;
      }
      const emailContent = getEmailContent(
        NotificationType.DRIVER_QUOTED,
        payload
      );
      await NotificationRepository.saveNotification({
        userId: payload?.driver?.userId,
        breakdownRequestId: payload.breakdownRequestId,
        title: emailContent.subject,
        message: emailContent.htmlBody,
        baseNotificationType: BaseNotificationType.EMAIL,
        notificationType: NotificationType.DRIVER_QUOTED.toString(),
        payload: JSON.stringify(payload),
        url: payload.viewRequestLink,
      });
      const emailPayloadType: EmailPayloadType = {
        recipientEmail: payload.user?.email,
        subject: emailContent.subject,
        htmlBody: emailContent.htmlBody,
      };

      await sendEmail(NotificationType.DRIVER_QUOTED, emailPayloadType);
      // modify payload as push notification expects
    }
  );
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTATION_UPDATED}`,
    async (payload: DriverQuotedEventPayload) => {
      const isAlreadySent = false;
      await NotificationRepository.checkNotificationSent({
        userId: payload.driver.userId,
        notificationType: NotificationType.DRIVER_QUOTATION_UPDATED,
        deliveryType: BaseNotificationType.EMAIL,
        breakdownRequestId: payload.requestId.toString(),
      });

      if (isAlreadySent) {
        console.log(`Email already sent for driver: ${payload.driver.userId}`);
        return;
      }
      const emailContent = getEmailContent(
        NotificationType.DRIVER_QUOTED,
        payload
      );
      await NotificationRepository.saveNotification({
        userId: payload?.driver?.userId,
        breakdownRequestId: payload.requestId,
        title: emailContent.subject,
        message: emailContent.htmlBody,
        baseNotificationType: BaseNotificationType.EMAIL,
        notificationType: NotificationType.DRIVER_QUOTATION_UPDATED.toString(),
        payload: JSON.stringify(payload),
        url: payload.viewRequestLink,
      });
      const emailPayloadType: EmailPayloadType = {
        recipientEmail: payload.user?.email,
        subject: emailContent.subject,
        htmlBody: emailContent.htmlBody,
      };

      await sendEmail(NotificationType.DRIVER_QUOTATION_UPDATED, emailPayloadType);
      // modify payload as push notification expects
    }
  );

  // USER_REQUEST handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.USER_REQUEST}`,
    async payload => {
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
    async payload => {
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
    async payload => {
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
    async payload => {
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
    async payload => {
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
    async payload => {
      try {
        await sendEmail(NotificationType.DRIVER_ASSIGNED, payload);
      } catch (error) {
        console.error("Error sending DRIVER_ASSIGNED email:", error);
      }
    }
  );

  // DRIVER_QUOTE handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTED}`,
    async payload => {
      try {
        await sendEmail(NotificationType.DRIVER_QUOTED, payload);
      } catch (error) {
        console.error("Error sending DRIVER_QUOTE email:", error);
      }
    }
  );

  // DRIVER_ACCEPT handler
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_ACCEPT}`,
    async payload => {
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
    async payload => {
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
    async payload => {
      try {
        await sendEmail(NotificationType.RATING_REVIEW, payload);
      } catch (error) {
        console.error("Error sending RATING_REVIEW email:", error);
      }
    }
  );
}
