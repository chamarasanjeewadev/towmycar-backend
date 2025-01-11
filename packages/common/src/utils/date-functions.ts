import { addDays, format, isAfter, isBefore } from "date-fns";
import { TRIAL_PERIOD_DAYS } from "./common-consts";

export const formatDate = (
  date: string | number | Date | null | undefined,
): string => {
  if (!date) return "N/A";
  return format(new Date(date), "PPp");
};

export const isTrialPeriodExpired = (
  driverCreatedDate: string | number | Date | null | undefined,
): boolean => {
  if (!driverCreatedDate) return true;
  const isExpired = isAfter(
    new Date(), 
    addDays(new Date(driverCreatedDate), TRIAL_PERIOD_DAYS), // Trial expiration date
  );
  return isExpired;
};
