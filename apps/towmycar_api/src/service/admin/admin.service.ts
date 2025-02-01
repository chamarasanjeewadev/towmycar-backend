import { ContactUsEventPayload, ContactUsPayload, emitNotificationEvent, NotificationType } from "@towmycar/common";

export const ContactUsEmail=(payload:ContactUsEventPayload)=>{
    const contactUsPayload:ContactUsPayload={
        firstName:payload.firstName,
        lastName:payload.lastName,
        email:payload.email,
        message:payload.message,
        user:null,
        driver:null
    }
    emitNotificationEvent(NotificationType.ADMIN_CONTACTUS_NOTIFICATION, contactUsPayload);
    
}