import { DriverSearchRepository } from "../repository/driversearch.repository";

import {
  VIEW_REQUEST_BASE_URL,
  NOTIFICATION_REQUEST_SNS_TOPIC_ARN,
} from "../config";
import {
  createGoogleMapsDirectionsLink,
  createGoogleMapsLink,
  DriverNotificationEmailPayload,
  EmailPayloadBaseType,
  EmailPayloadType,
  PushNotificationPayload,
  sendNotification,
} from "@towmycar/common";
import {
  BaseNotificationType,
  EmailNotificationType,
  PushNotificationType,
  formatDate,
} from "@towmycar/common";
import {
  DriverNotificationType,
  NearbyDriver,
  SingleDriverNotificationType,
  UserWithCustomer,
} from "../types/types";

// Add User interface (you might want to import this from a shared types file)

export type DriverSearchServiceType = {
  findAndNotifyNearbyDrivers: (requestId: number) => Promise<NearbyDriver[]>;
};

const findAndNotifyNearbyDrivers = async (
  requestId: number
): Promise<NearbyDriver[]> => {
  try {
    console.log("finding nearby drivers for requestId:", requestId);
    const request = await DriverSearchRepository.getBreakdownRequestById(
      requestId
    );

    if (!request) {
      throw new Error(`Breakdown request not found for ID: ${requestId}`);
    }

    // Validate location data
    if (!request.location?.latitude || !request.location?.longitude) {
      throw new Error(`Invalid pickup location for request ID: ${requestId}`);
    }

    // Find nearby drivers with validated parameters
    const nearbyDrivers = await DriverSearchRepository.findNearbyDrivers(
      request.location.latitude,
      request.location.longitude,
      request?.toLocation?.latitude ?? null,
      request?.toLocation?.longitude ?? null,
      request?.weight ?? null
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

      await sendNotifications({
        nearbyDrivers,
        requestId,
        location: request.toLocation,
        toLocation: request.location,
        customerId: request.customerId,
        createdAt: request.createdAt,
      });
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

const sendNotifications = async ({
  nearbyDrivers,
  requestId,
  customerId,
  toLocation,
  location,
  createdAt,
}: DriverNotificationType) => {
  console.log("Sending notifications to nearby drivers", {
    nearbyDrivers,
    requestId,
    toLocation,
    location,
    customerId,
  });

  try {
    const user = await DriverSearchRepository.getUserByCustomerId(customerId);
    const notificationPromises = nearbyDrivers.map(driver =>
      sendDriverNotifications({
        driver,
        customerId,
        user,
        requestId,
        location,
        toLocation,
        createdAt,
      })
    );
    // send push notification to user stating request has been assigned to few drivers

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error("Error in sendNotifications:", error);
  }
};

async function sendDriverNotifications({
  driver,
  user,
  requestId,
  location,
  toLocation,
  createdAt,
}: SingleDriverNotificationType) {
  const viewRequestLink = `${VIEW_REQUEST_BASE_URL}/driver/requests/${requestId}`;
  const googleMapsLink = createGoogleMapsDirectionsLink(location, toLocation);
  const email: DriverNotificationEmailPayload = {
    breakdownRequestId: requestId,
    googleMapsLink,
    driver,
    // @ts-ignore
    user,
    viewRequestLink,
    recipientEmail: "towmycar.uk@gmail.com", // driver.email??"towmycar.uk@gmail.com",
    createdAt,
  };
  
  const pushNotificationPayload: PushNotificationPayload = {
    title: "New Towing Request #" + requestId,
    userId: driver.id,
    url: viewRequestLink,
    message:
      `New towing request #${requestId} has been assigned to you. Tap to view request details and respond.`,
  };

  try {
    await Promise.all([
      sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: EmailNotificationType.DRIVER_ASSIGNED_EMAIL,
        payload: email,
      }),
      sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
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
