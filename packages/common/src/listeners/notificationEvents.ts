import { eventBus } from "./eventBus";
import { EventPayload, ListnerPayload, NotificationType, sendNotification } from '@towmycar/common';


export const emitNotificationEvent = (
  type: NotificationType,
  payload:EventPayload 
) => {
  eventBus.emit(type, payload);
};
