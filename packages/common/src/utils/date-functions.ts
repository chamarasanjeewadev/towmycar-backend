import { addMonths, format, isAfter, isBefore } from "date-fns";

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
    addMonths(new Date(driverCreatedDate), 3),
    new Date(Date.now()),
  );
};
