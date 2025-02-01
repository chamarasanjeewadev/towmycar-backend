import { ContactUsEventPayload, ContactUsPayload, emitNotificationEvent, NotificationType } from "@towmycar/common";

export const ContactUsEmail=(payload:ContactUsEventPayload)=>{
    emitNotificationEvent(NotificationType.ADMIN_CONTACTUS_NOTIFICATION, payload);
    
}