import { EventEmitter } from "events";
import {
  sendNotification as sendSNSNotification,
  DriverNotifyEventPayload,
  NotificationType,
  DriverQuotedEventPayload,
  UserNotificationNotificationpayload,
  UserNotificationPayload,
  DriverQuotedPayload,
  UserAcceptedPayload,
  UserAcceptedEventPayload,
  UserRejectedPayload,
  DriverClosedEventPayload,
  ChatNotificationEventPayload,
  DriverQuotationUpdatedPayload,
  AdminApprovalRequestPayload,
} from "@towmycar/common";

export function registerNotificationListener(emitter: EventEmitter): void {
  emitter.on(
    NotificationType.DRIVER_NOTIFICATION,
    async (payload: DriverNotifyEventPayload) => {
      const snsNotificationPayload = payload?.drivers.map(driver => ({
        ...payload,
        sendToId: driver.userId,
        driver: driver,
        location: payload.location,
        breakdownRequestId: payload.breakdownRequestId,
        user: payload.user,
        viewRequestLink: payload.viewRequestLink,
        createdAt: payload.createdAt,
        googleMapsLink: payload.googleMapsLink,
        make: payload.make,
        model: payload.model,
      }));

      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.DRIVER_NOTIFICATION,
          payload: snsNotificationPayload as any,
        },
      );
    },
  );

  emitter.on(
    NotificationType.USER_NOTIFICATION,
    async (payload: UserNotificationNotificationpayload) => {
      const driverNotificationPlayload: UserNotificationPayload = {
        sendToId: payload.user.id,
        driver: payload.driver,
        location: payload.location,
        breakdownRequestId: payload.breakdownRequestId,
        user: payload.user,
        viewRequestLink: payload.viewRequestLink,
        createdAt: payload.createdAt,
        googleMapsLink: payload.googleMapsLink,
      };
      // modify payload as push notification expects
      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.USER_NOTIFICATION,
          payload: driverNotificationPlayload,
        },
      );
    },
  );

  emitter.on(
    NotificationType.DRIVER_QUOTED,
    async (payload: DriverQuotedEventPayload) => {
      const driverQuotedPlayload: DriverQuotedPayload = {
        sendToId: payload.user.id,
        driver: payload.driver,
        breakdownRequestId: payload.breakdownRequestId,
        user: payload.user,
        viewRequestLink: payload.viewRequestLink,
        price: payload.newPrice,
        estimation: payload.estimation,
      };
      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.DRIVER_QUOTED,
          payload: driverQuotedPlayload,
        },
      );
    },
  );
  emitter.on(
    NotificationType.DRIVER_QUOTATION_UPDATED,
    async (payload: DriverQuotedEventPayload) => {
      const driverQuotedPlayload: DriverQuotationUpdatedPayload = {
        sendToId: payload.user.id,
        driver: payload.driver,
        breakdownRequestId: payload.breakdownRequestId,
        user: payload.user,
        viewRequestLink: payload.viewRequestLink,
        previousPrice: 0, //TODO
        newPrice: payload.newPrice,
        estimation: payload.estimation,
        explanation:payload.explanation
      };
      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.DRIVER_QUOTATION_UPDATED,
          payload: driverQuotedPlayload,
        },
      );
    },
  );

  emitter.on(NotificationType.DRIVER_REGISTERED, async payload => {
    const notificationPayload = {
      ...payload,
      sendToId: payload.driver.userId,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_REGISTERED,
      payload: notificationPayload,
    });
  });

  emitter.on(NotificationType.USER_REQUEST, async payload => {
    const notificationPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_REQUEST,
      payload: notificationPayload,
    });
  });

  emitter.on(NotificationType.USER_CREATED, async payload => {
    const notificationPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_CREATED,
      payload: notificationPayload,
    });
  });

  emitter.on(
    NotificationType.USER_ACCEPTED,
    async (payload: UserAcceptedEventPayload) => {
      const userAcceptedPlayload: UserAcceptedPayload = {
        ...payload,
        sendToId: payload.driver.userId,
      };

      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.USER_ACCEPTED,
          payload: userAcceptedPlayload,
        },
      );
    },
  );

  emitter.on(NotificationType.USER_REJECTED, async payload => {
    const userRejectedPlayload: UserRejectedPayload = {
      ...payload,
      sendToId: payload.driver.userId,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_REJECTED,
      payload: userRejectedPlayload,
    });
  });

  emitter.on(NotificationType.DRIVER_REJECTED, async payload => {
    const notificationPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_REJECTED,
      payload: notificationPayload,
    });
  });

  emitter.on(NotificationType.DRIVER_ASSIGNED, async payload => {
    const notificationPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_ASSIGNED,
      payload: notificationPayload,
    });
  });

  emitter.on(NotificationType.DRIVER_ACCEPTED, async payload => {
    const notificationPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_ACCEPTED,
      payload: notificationPayload,
    });
  });

  emitter.on(
    NotificationType.DRIVER_CLOSED,
    async (payload: DriverClosedEventPayload) => {
      const notificationPayload = {
        ...payload,
        sendToId: payload.user.id,
      };

      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.RATING_REVIEW,
          payload: notificationPayload,
        },
      );
    },
  );

  emitter.on(
    NotificationType.DRIVER_CHAT_INITIATED,
    async (payload: ChatNotificationEventPayload) => {
      const chatPayload = {
        ...payload,
        sendToId: payload?.user.id,
      };

      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.DRIVER_CHAT_INITIATED,
          payload: chatPayload,
        },
      );
    },
  );
  emitter.on(
    NotificationType.USER_CHAT_INITIATED,
    async (payload: ChatNotificationEventPayload) => {
      const chatPayload = {
        ...payload,
        breakdownRequestId: payload.breakdownRequestId,
        sendToId: payload.driver?.userId,
      };

      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.USER_CHAT_INITIATED,
          payload: chatPayload,
        },
      );
    },
  );
  emitter.on(
    NotificationType.ADMIN_APPROVAL_REQUEST,
    async (payload: AdminApprovalRequestPayload) => {
      payload.admins.forEach(async admin => {
        const notificationPayload = {
          ...payload,
          sendToId: admin.userId,
        };
        await sendSNSNotification(
          process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
          {
            subType: NotificationType.ADMIN_APPROVAL_REQUEST,
            payload: notificationPayload,
          },
        );
      });
    
    },
  );
}
