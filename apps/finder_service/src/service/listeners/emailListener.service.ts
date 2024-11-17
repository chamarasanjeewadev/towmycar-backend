import { EventEmitter } from 'events';
import { NOTIFICATION_REQUEST_SNS_TOPIC_ARN } from "../../config";
import { 
  BaseNotificationType, 
  EmailNotificationType,
  sendNotification,
  DriverNotificationEmailPayload 
} from "@towmycar/common";
import { NOTIFICATION_EVENTS, DriverNotificationEventPayload } from '../../events/notificationEvents';

export function initializeEmailListener(emitter: EventEmitter) {
  emitter.on(NOTIFICATION_EVENTS.NOTIFY_DRIVERS, async (payload: DriverNotificationEventPayload) => {
    const { driver, requestId, user, googleMapsLink, viewRequestLink, createdAt } = payload;

    const emailPayload: Omit<DriverNotificationEmailPayload, 'recipientEmail'> & { recipientEmail: string } = {
      breakdownRequestId: requestId,
      googleMapsLink,
      driver,
      //@ts-ignore
      user,
      viewRequestLink,
      createdAt,
      recipientEmail: driver.email ?? "towmycar.uk@gmail.com",
    };

    try {
      await sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: EmailNotificationType.DRIVER_ASSIGNED_EMAIL,
        payload: emailPayload,
      });
      
      console.log(`Email notification sent successfully to driver ${driver.id}`);
    } catch (error) {
      console.error(`Error sending email notification to driver ${driver.id}:`, error);
    }
  });
} 