import { EventEmitter } from 'events';
import { NOTIFICATION_REQUEST_SNS_TOPIC_ARN } from "../../config";
import { 
  BaseNotificationType, 
  PushNotificationType,
  sendNotification,
  PushNotificationPayload 
} from "@towmycar/common";
import { NOTIFICATION_EVENTS, DriverNotificationEventPayload } from '../../events/notificationEvents';

export function initializePushNotificationListener(emitter: EventEmitter) {
  emitter.on(NOTIFICATION_EVENTS.NOTIFY_DRIVERS, async (payload: DriverNotificationEventPayload) => {
    const { driver, requestId,user, viewRequestLink } = payload;

    const pushNotificationPayload: PushNotificationPayload = {
      title: `New Towing Request #${requestId}`,
      userId: user?.id,
      url: viewRequestLink,
      message: `New towing request #${requestId} has been assigned to you. Tap to view request details and respond.`,
    };

    try {
      await sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.PUSH,
        subType: PushNotificationType.NOTIFY_DRIVER_NOTIFICATION,
        payload: pushNotificationPayload,
      });
      
      console.log(`Push notification sent successfully to driver ${driver.id}`);
    } catch (error) {
      console.error(`Error sending push notification to driver ${driver.id}:`, error);
    }
  });
} 