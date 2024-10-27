import {
  DriverSearchRepository,
  NearbyDriver,
} from "../repository/driversearch.repository";
import { sendNotification as sendSNSNotification } from "../utils/sns.service";

import {
  VIEW_REQUEST_BASE_URL,
  NOTIFICATION_REQUEST_SNS_TOPIC_ARN,
} from "../config";
import {
  EmailPayloadBaseType,
  EmailPayloadType,
  PushNotificationPayload,
} from "@towmycar/common";
import {
  BaseNotificationType,
  EmailNotificationType,
  PushNotificationType,
} from "@towmycar/common";
import { UserWithCustomer } from "../types/types";

// Add User interface (you might want to import this from a shared types file)


export type DriverSearchServiceType = {
  findAndNotifyNearbyDrivers: (
    latitude: number,
    longitude: number,
    requestId: number,
    customerId: number
  ) => Promise<NearbyDriver[]>;
};

const findAndNotifyNearbyDrivers = async (
  latitude: number,
  longitude: number,
  requestId: number,
  customerId: number
): Promise<NearbyDriver[]> => {
  try {
    console.log("finding nearby drivers for requestId:", requestId);
    // Find nearby drivers
    const nearbyDrivers = await DriverSearchRepository.findNearbyDrivers(
      latitude,
      longitude
    );
    console.log("nearbyDrivers...........", nearbyDrivers);

    // Only update and return if nearby drivers are available
    if (nearbyDrivers && nearbyDrivers.length > 0) {
      // Pass the full nearbyDrivers array to updateDriverRequests
      await DriverSearchRepository.updateDriverRequests(
        requestId,
        nearbyDrivers
      );
      console.log("Updated driver requests for requestId:", requestId);
      console.log("trying to send notifications, calling sendNotifications");

      await sendNotifications(
        nearbyDrivers,
        requestId,
        latitude,
        longitude,
        customerId
      );
      return nearbyDrivers;
    } else {
      console.log("No nearby drivers found for requestId:", requestId);
      return [];
    }

    // Get user details
    // const user = await DriverSearchRepository.getUserByCustomerId(customerId);

    // Send notifications to nearby drivers

    // Send notification to the user
    // await sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
    //   type: EmailNotificationType.USER_NOTIFICATION_EMAIL,
    //   payload: {
    //     breakdownRequestId: requestId,
    //     user,
    //     viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${requestId}`,
    //   },
    // });

    console.log("should be requestId", requestId);
    return nearbyDrivers;
  } catch (error) {
    console.error("Error in findAndNotifyNearbyDrivers:", error);
    throw error;
  }
};

const sendNotifications = async (
  nearbyDrivers: NearbyDriver[],
  requestId: number,
  latitude: number,
  longitude: number,
  customerId: number
) => {
  console.log("Sending notifications to nearby drivers", {
    nearbyDrivers,
    requestId,
    latitude,
    longitude,
    customerId,
  });

  try {
    const user = await DriverSearchRepository.getUserByCustomerId(customerId);
    const notificationPromises = nearbyDrivers.map(driver =>
      sendDriverNotifications(driver, user, requestId, latitude, longitude)
    );
    // send push notification to user stating request has been assigned to few drivers

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error("Error in sendNotifications:", error);
  }
};

async function sendDriverNotifications(
  driver: NearbyDriver,
  user: UserWithCustomer|null,
  requestId: number,
  latitude: number,
  longitude: number
) {
  const viewRequestLink = `${VIEW_REQUEST_BASE_URL}/driver/view-requests/${requestId}`;

  const emailPayload: EmailPayloadBaseType & Partial<EmailPayloadType> = {
    breakdownRequestId: requestId,
    location: `Latitude: ${latitude}, Longitude: ${longitude}`,
    driver,
    // @ts-ignore
    user,
    viewRequestLink,
    recipientEmail:"towmycar.uk@gmail.com"//TODO change to  driver.email,
  };

  const pushNotificationPayload: PushNotificationPayload = {
    title: "New Request Assignment",
    userId: driver.id,
    url: viewRequestLink,
    message:
      "You have been assigned to a new request. Please check your requests in the TowMyCar app.",
  };

  try {
    await Promise.all([
      sendSNSNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: EmailNotificationType.DRIVER_ASSIGNED_EMAIL,
        payload: emailPayload,
      }),
      sendSNSNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.PUSH,
        subType: PushNotificationType.DRIVER_ASSIGNED_NOTIFICATION,
        payload: pushNotificationPayload,
      }),
    ]);

    console.log(`Notifications sent successfully to driver ${driver.id}`);
  } catch (error) {
    console.error(`Error sending notifications to driver ${driver.id}:`, error);
  }
}

export const DriverSearchService: DriverSearchServiceType = {
  findAndNotifyNearbyDrivers,
};
