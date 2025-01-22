import { EventEmitter } from "events";
import {
  DeliveryNotificationType,
  NotificationType,
  DriverNotificationPayload,
  EmailPayloadType,
  UserNotificationPayload,
  DriverQuotedPayload,
  ListnerPayload,
  UserRejectedPayload,
  AdminApprovalRequestPayload,
} from "@towmycar/common";
import {
  getEmailContent,
  sendEmail,
} from "../service/notification.email.service";
import { NotificationRepository } from "../repository/notification.repository";
import { logger } from "@towmycar/common";
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

export function registerEmailListener(emitter: EventEmitter): void {
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload[]) => {
      const processPromises = payload.map(async payload => {
        const emailContent = getEmailContent(
          NotificationType.DRIVER_NOTIFICATION,
          payload,
        );

        await checkAndProcessEmail({
          payload,
          notificationType: NotificationType.DRIVER_NOTIFICATION,
          userId: payload.sendToId,
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
    },
  );

  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_NOTIFICATION,
        payload,
      );

      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_NOTIFICATION,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTED}`,
    async (payload: DriverQuotedPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_QUOTED,
        payload,
      );

      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_QUOTED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_QUOTATION_UPDATED}`,
    async (payload: DriverQuotedPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_QUOTATION_UPDATED,
        payload,
      );

      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_QUOTATION_UPDATED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );

  // USER_REQUEST handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_REQUEST}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_REQUEST,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_REQUEST,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );

  // DRIVER_REGISTERED handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_REGISTERED}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_REGISTERED,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_REGISTERED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    },
  );

  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.ADMIN_APPROVAL_REQUEST}`,
    async (payload: AdminApprovalRequestPayload) => {
      const emailContent = getEmailContent(
        NotificationType.ADMIN_APPROVAL_REQUEST,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.ADMIN_APPROVAL_REQUEST,
        userId: payload?.sendToId,
        breakdownRequestId: null, // payload?.breakdownRequestId,
        emailContent,
        recipientEmail: "hello.towmycar.uk@gmail.com",
      });
    },
  );

  // USER_CREATED handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_CREATED}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_CREATED,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_CREATED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );

  // USER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_ACCEPTED}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_ACCEPTED,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_ACCEPTED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    },
  );

  // DRIVER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_REJECTED}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_REJECTED,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_REJECTED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    },
  );

  // DRIVER_ASSIGNED handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_ASSIGNED}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_ASSIGNED,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_ASSIGNED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.driver.email,
      });
    },
  );

  // DRIVER_ACCEPT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.DRIVER_ACCEPTED}`,
    async (payload: DriverNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.DRIVER_ACCEPTED,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.DRIVER_ACCEPTED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );

  // USER_REJECT handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.USER_REJECTED}`,
    async (payload: UserRejectedPayload) => {
      const emailContent = getEmailContent(
        NotificationType.USER_REJECTED,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.USER_REJECTED,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );

  // RATING_REVIEW handler
  emitter.on(
    `${DeliveryNotificationType.EMAIL}:${NotificationType.RATING_REVIEW}`,
    async (payload: UserNotificationPayload) => {
      const emailContent = getEmailContent(
        NotificationType.RATING_REVIEW,
        payload,
      );
      await checkAndProcessEmail({
        payload,
        notificationType: NotificationType.RATING_REVIEW,
        userId: payload.sendToId,
        breakdownRequestId: payload.breakdownRequestId,
        emailContent,
        recipientEmail: payload.user.email,
      });
    },
  );
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
      breakdownRequestId:  payload.breakdownRequestId,
    });

    // if (isAlreadySent) {
    //   console.log(`Email already sent for user: ${userId}`);
    //   logger.info(`Email already sent for user ${userId},${notificationType}, ${payload.breakdownRequestId}`);
    //   return false;
    // }
    const emailPayload: EmailPayloadType = {
      recipientEmail,
      subject: emailContent.subject,
      htmlBody: emailContent.htmlBody,
    };

    const result = await sendEmail(emailPayload);
    if (result) {
      await NotificationRepository.saveNotification({
        userId,
        breakdownRequestId,
        title: emailContent.subject,
        message: emailContent.htmlBody,
        deliveryType: DeliveryNotificationType.EMAIL,
        notificationType: notificationType,
        payload: JSON.stringify(payload),
        url: payload.viewRequestLink,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to process email for user ${userId}:`, error);
    logger.error(`Failed to process email for user ${userId}:`, error);
    return false;
  }
}
