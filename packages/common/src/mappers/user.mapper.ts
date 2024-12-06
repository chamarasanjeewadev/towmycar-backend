import { UserWithDriver, UserWithCustomer } from '../types/types';

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

export function mapToUserWithDriver(driverInfo: DriverInfo): UserWithDriver {
  return {
    userId: driverInfo.userId,
    email: driverInfo.email,
    firstName: driverInfo.firstName,
    lastName: driverInfo.lastName || undefined,
    phoneNumber: driverInfo.phoneNumber || undefined,
    driver: {
      id: driverInfo.driverId,
      phoneNumber: driverInfo.phoneNumber,
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