import { UserWithDriver, UserWithCustomer, BreakdownAssignmentDetails } from '../types/types';

interface DriverInfo {
  userId: number;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  driverId: number;
}

interface CustomerInfo {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  mobileNumber?: string;
}

export function mapToUserWithDriver(driverInfo: BreakdownAssignmentDetails): UserWithDriver {
  return {
    userId: driverInfo.id,
    email: driverInfo.driver?.email??"",
    firstName: driverInfo.driver?.firstName || undefined,
    lastName: driverInfo.driver?.lastName || undefined,
    phoneNumber: driverInfo.driver?.phoneNumber || undefined,
    driver: {
      id: driverInfo.driver?.id,
      phoneNumber: driverInfo.driver?.phoneNumber,
    },
  };
}

export function mapToUserWithCustomer(customerInfo: CustomerInfo): UserWithCustomer {
  return {
    id: customerInfo.id,
    email: customerInfo.email,
    firstName: customerInfo.firstName,
    lastName: customerInfo.lastName,
    phoneNumber: customerInfo.mobileNumber || undefined,
    customer: {
      id: customerInfo.id,
      phoneNumber: customerInfo.mobileNumber,
    },
  };
} 