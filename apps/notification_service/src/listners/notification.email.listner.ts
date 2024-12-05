import { EventEmitter } from "events";
import {
  DeliveryNotificationType,
  DriverQuotedEventPayload,
  NotificationType,
  DriverNotificationPayload,
  EmailPayloadType,
  UserNotificationPayload,
  DriverQuotedPayload,
  ListnerPayload,
} from "@towmycar/common";
import {
  getEmailContent,
  sendEmail,
} from "../service/notification.email.service";
import { NotificationRepository } from "../repository/notification.repository";

interface CheckAndProcessEmailParams {
  payload: ListnerPayload;
  notificationType: NotificationType;
  userId: number;
  breakdownRequestId: number;
  emailContent: {
    subject: string;
    htmlBody: string;
  };
  recipientEmail: string;
}

async function checkAndProcessEmail({
  payload,
  notificationType,
  userId,
  breakdownRequestId,
  emailContent,
  recipientEmail,
}: CheckAndProcessEmailParams) {
  try {
    const isAlreadySent = await NotificationRepository.checkNotificationSent({
      userId,
      notificationType,
      deliveryType: DeliveryNotificationType.EMAIL,
      breakdownRequestId: breakdownRequestId,
    });

    if (isAlreadySent) {
      console.log(`Email already sent for user: ${userId}`);
      return false;
    }
    const emailPayloadType: EmailPayloadType = {
      recipientEmail,
      subject: emailContent.subject,
      htmlBody: emailContent.htmlBody,
    };

    await sendEmail(notificationType, emailPayloadType);

    await NotificationRepository.saveNotification({
      userId,
      breakdownRequestId,
      title: emailContent.subject,
      message: emailContent.htmlBody,
      baseNotificationType: DeliveryNotificationType.EMAIL,
      deliveryType: DeliveryNotificationType.EMAIL,
      notificationType: notificationType,
      payload: JSON.stringify(payload),
      url: payload.viewRequestLink,
    });

    return true;
  } catch (error) {
    console.error(`Failed to process email for user ${userId}:`, error);
    return false;
  }
}

export function registerEmailListener(emitter: EventEmitter): void {
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload[]) => {
      const processPromises = payload.map(async payload => {
        const emailContent = getEmailContent(
          NotificationType.USER_NOTIFICATION,
          payload
        );

        await checkAndProcessEmail({
          payload,
          notificationType: NotificationType.DRIVER_NOTIFICATION,
          userId: payload.driver.userId,
          breakdownRequestId: payload.breakdownRequestId,
          emailContent,
          recipientEmail: payload.driver.email,
        });
      });

      try {
        await Promise.allSettled(processPromises);
      } catch (error) {
        console.error("Error processing email notifications:", error);
      }
    }
  );

  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_NOTIFICATION,
        payload
      );

      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_NOTIFICATION,
        userId: payload.driver.userId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTED}`,
    async (payload: DriverQuotedPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_QUOTED,
        payload
      );

      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_QUOTED,
        userId: payload.driver.userId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTATION_UPDATED}`,
    async (payload: DriverQuotedPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_QUOTATION_UPDATED,
        payload
      );

      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_QUOTATION_UPDATED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );

  // USER_REQUEST handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_REQUEST}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_REQUEST,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_REQUEST,
        userId: payload.user.id,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );

  // DRIVER_REGISTERED handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_REGISTERED}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_REGISTERED,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_REGISTERED,
        userId: payload.driver.userId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    }
  );

  // USER_CREATED handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_CREATED}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_CREATED,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_CREATED,
        userId: payload.user.id,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );

  // USER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_ACCEPT}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_ACCEPT,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_ACCEPT,
        userId: payload.user.id,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );

  // DRIVER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_REJECT}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_REJECT,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_REJECT,
        userId: payload.driver.userId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    }
  );

  // DRIVER_ASSIGNED handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_ASSIGNED}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_ASSIGNED,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_ASSIGNED,
        userId: payload.driver.userId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    }
  );

  // DRIVER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_ACCEPT}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_ACCEPT,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_ACCEPT,
        userId: payload.driver.userId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    }
  );

  // USER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_REJECT}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_REJECT,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_REJECT,
        userId: payload.user.id,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );

  // RATING_REVIEW handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.RATING_REVIEW}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.RATING_REVIEW,
        payload
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.RATING_REVIEW,
        userId: payload.user.id,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    }
  );
}
