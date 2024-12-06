import { NotificationType } from "@towmycar/common";

const SKIP_DUPLICATE_CHECK_TYPES = new Set([
  NotificationType.DRIVER_QUOTATION_UPDATED,
  // Add other notification types that should skip duplicate checking
]);

export function shouldCheckDuplicate(notificationType: NotificationType): boolean {
  return !SKIP_DUPLICATE_CHECK_TYPES.has(notificationType);
} 