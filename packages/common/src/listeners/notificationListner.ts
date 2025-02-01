import {
  AdminApprovalRequestPayload,
  ChatNotificationEventPayload,
  ContactUsPayload,
  DriverAcceptPayload,
  DriverClosedEventPayload,
  DriverCreatedAdminNotificationEventPayload,
  DriverCreatedAdminNotificationPayload,
  DriverQuotationUpdatedPayload,
  DriverQuotedEventPayload,
  DriverRejectedEventPayload,
  NotificationType,
  sendSNS,
  sendNotification as sendSNSNotification,
  UserAcceptedEventPayload,
  UserAcceptedPayload,
} from "@towmycar/common";
import { eventBus } from "./eventBus";

export class NotificationListener {
  private static instance: NotificationListener;

  private constructor() {
    this.registerListeners();
  }

  public static getInstance(): NotificationListener {
    if (!NotificationListener.instance) {
      NotificationListener.instance = new NotificationListener();
    }
    return NotificationListener.instance;
  }

  private registerListeners(): void {
    // eventBus.on(NotificationType.DRIVER_NOTIFICATION, this.handleDriverNotification);
    // eventBus.on(NotificationType.USER_NOTIFICATION, this.handleUserNotification);
    eventBus.on(
      NotificationType.DRIVER_CREATED_ADMIN_NOTIFICATION,
      this.handleUserCreatedDriverNotification,
    );
    eventBus.on(
      NotificationType.USER_ACCEPTED,
      this.handleUserAcceptedPlayload,
    );
    eventBus.on(
      NotificationType.DRIVER_CHAT_INITIATED,
      this.handleDriverChatTriggered,
    );
    eventBus.on(
      NotificationType.USER_CHAT_INITIATED,
      this.handleUserChatInitiated,
    );

    eventBus.on(
      NotificationType.ADMIN_APPROVAL_REQUEST,
      this.handleAdminApprovalRequest,
    );
    eventBus.on(
      NotificationType.DRIVER_QUOTATION_UPDATED,
      this.handleDriverQuotationUpdated,
    );
    eventBus.on(NotificationType.DRIVER_REJECTED, this.handleDriverRejected);
    eventBus.on(NotificationType.DRIVER_CLOSED, this.handleDriverClosed);

    eventBus.on(NotificationType.DRIVER_ACCEPTED, this.handleDriverAccepted);

    eventBus.on(
      NotificationType.ADMIN_CONTACTUS_NOTIFICATION,
      this.handleAdminContactUs,
    );

    // Register other listeners...
  }

  private async handleUserAcceptedPlayload(payload: UserAcceptedEventPayload) {
    const userAcceptedPlayload: UserAcceptedPayload = {
      ...payload,
      sendToId: payload.driver.userId,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_ACCEPTED,
      payload: userAcceptedPlayload,
    });
  }

  private async handleUserCreatedDriverNotification(
    payload: DriverCreatedAdminNotificationPayload,
  ) {
    const notificationPayload: DriverCreatedAdminNotificationPayload = {
      userInfo: payload?.userInfo,
      viewRequestLink: payload?.viewRequestLink, //TODO admins must dynamically attached
    };
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_CREATED_ADMIN_NOTIFICATION,
      payload: notificationPayload,
    });
  }

  private async handleDriverChatTriggered(
    payload: ChatNotificationEventPayload,
  ) {
    const chatPayload = {
      ...payload,
      sendToId: payload?.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_CHAT_INITIATED,
      payload: chatPayload,
    });
  }

  private async handleUserChatInitiated(payload: ChatNotificationEventPayload) {
    const chatPayload = {
      ...payload,
      breakdownRequestId: payload.breakdownRequestId,
      sendToId: payload.driver?.userId,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_CHAT_INITIATED,
      payload: chatPayload,
    });
  }

  private async handleAdminApprovalRequest(
    payload: AdminApprovalRequestPayload,
  ) {
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
  }

  private async handleDriverQuotationUpdated(
    payload: DriverQuotedEventPayload,
  ) {
    const driverQuotedPlayload: DriverQuotationUpdatedPayload = {
      sendToId: payload.user.id,
      driver: payload.driver,
      breakdownRequestId: payload.breakdownRequestId,
      user: payload.user,
      viewRequestLink: payload.viewRequestLink,
      previousPrice: 0, //TODO
      newPrice: payload.newPrice,
      estimation: payload.estimation,
      explanation: payload.explanation,
    };
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_QUOTATION_UPDATED,
      payload: driverQuotedPlayload,
    });
  }

  private async handleDriverRejected(payload: DriverRejectedEventPayload) {
    const notificationPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_REJECTED,
      payload: notificationPayload,
    });
  }

  private async handleDriverAccepted(payload: DriverAcceptPayload) {
    const notificationPayload: DriverAcceptPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_ACCEPTED,
      payload: notificationPayload,
    });
  }

  private async handleAdminContactUs(payload: ContactUsPayload) {
    const notificationPayload: ContactUsPayload = {
      ...payload,
      admins: [],
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_ACCEPTED,
      payload: notificationPayload,
    });
  }

  async handleDriverClosed(payload: DriverClosedEventPayload) {
    const notificationPayload = {
      ...payload,
      sendToId: payload.user.id,
    };

    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.RATING_REVIEW,
      payload: notificationPayload,
    });
  }
}
