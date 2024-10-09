import {
  DriverSearchRepository,
  NearbyDriver,
} from "../repository/driversearch.repository";
import { sendNotification } from "../utils/sns.service";
import { EmailNotificationType } from "../enums";
import { VIEW_REQUEST_BASE_URL, NOTIFICATION_REQUEST_SNS_TOPIC_ARN } from "../config";

export type DriverSearchServiceType = {
  findAndUpdateNearbyDrivers: (
    latitude: number,
    longitude: number,
    requestId: number,
    userId: number
  ) => Promise<NearbyDriver[]>;
};

const findAndUpdateNearbyDrivers = async (
  latitude: number,
  longitude: number,
  requestId: number,
  userId: number
): Promise<NearbyDriver[]> => {
  try {
    // Find nearby drivers
    const nearbyDrivers = await DriverSearchRepository.findNearbyDrivers(
      latitude,
      longitude
    );
console.log("nearbyDrivers...........",nearbyDrivers)
    // Pass the full nearbyDrivers array to updateDriverRequests
    await DriverSearchRepository.updateDriverRequests(requestId, nearbyDrivers);

    // Get user details
    // const user = await DriverSearchRepository.getUserById(userId);

    // Send notifications to nearby drivers
    // for (const driver of nearbyDrivers) {
    //   console.log(
    //     " try to send notification to driver",
    //     driver,
    //     EmailNotificationType.DRIVER_NOTIFICATION_EMAIL
    //   );
    //   await sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
    //     type: EmailNotificationType.DRIVER_NOTIFICATION_EMAIL,
    //     payload: {
    //       breakdownRequestId: requestId,
    //       driver,
    //       user,
    //       location: `${latitude}, ${longitude}`,
    //       viewRequestLink: `${VIEW_REQUEST_BASE_URL}/driver/view-requests/${requestId}`,
    //     },
    //   });
    // }

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
    console.error("Error in findAndUpdateNearbyDrivers:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const DriverSearchService: DriverSearchServiceType = {
  findAndUpdateNearbyDrivers,
};
