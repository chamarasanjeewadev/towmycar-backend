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
  return isAfter(
    new Date(Date.now()),
    addDays(new Date(driverCreatedDate), TRIAL_PERIOD_DAYS),
  );
};
