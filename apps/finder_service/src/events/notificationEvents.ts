import { NearbyDriver } from "@towmycar/common";

export interface Location {
  latitude: number;
  longitude: number;
}

export const NOTIFICATION_EVENTS = {
  NOTIFY_DRIVERS: "notify-drivers",
  NOTIFY_USER: "notify-user",
} as const;

// Import this from your shared types or define here
