//@ts-nocheck
import {
  DriverSearchRepository,
  NearbyDriver,
} from "../repository/driversearch.repository";
import { sendNotification } from "../utils/sns.service";
import { EmailNotificationType } from "../enums";
import {
  VIEW_REQUEST_BASE_URL,
  NOTIFICATION_REQUEST_SNS_TOPIC_ARN,
} from "../config";

// Add User interface (you might want to import this from a shared types file)
interface User {
  id: number;
  // Add other user properties as needed
}

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
  console.log(
    "calling sendNotifications, sending email or fcm notifications",
    nearbyDrivers,
    requestId,
    latitude,
    longitude,
    customerId
  );
  try {
    const user = await DriverSearchRepository.getUserByCustomerId(customerId);
    for (const driver of nearbyDrivers) {
      try {
        console.log(
          "Attempting to send notification to driver",
          driver,
          EmailNotificationType.DRIVER_NOTIFICATION_EMAIL
        );
        await sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
          type: EmailNotificationType.DRIVER_NOTIFICATION_EMAIL,
          payload: {
            breakdownRequestId: requestId,
            driver,
            user,
            location: `${latitude}, ${longitude}`,
            viewRequestLink: `${VIEW_REQUEST_BASE_URL}/driver/view-requests/${requestId}`,
          },
        });
        console.log(`Notification sent successfully to driver ${driver.id}`);
      } catch (error) {
        console.error(
          `Error sending notification to driver ${driver.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error in sendNotifications:", error);
  }
};

export const DriverSearchService: DriverSearchServiceType = {
  findAndNotifyNearbyDrivers,
};
