import { eq } from "drizzle-orm";
import { DB } from "../db/db.connection"; // Assuming you have a db connection file
import { driver, Driver } from "../db/schema/db-schema";
import { DriverInput } from "../dto/driver.dto";

const create = async (data: DriverInput): Promise<number> => {
  const driverResult = await DB.insert(driver)
    .values({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      vehicleType: data.vehicleType,
      vehicleRegistration: data.vehicleRegistration,
      licenseNumber: data.licenseNumber, // Fixed typo: 'licenseNumbber' to 'licenseNumber'
      serviceRadius: data.serviceRadius,
      primaryLocation: {
        x: data.primaryLocation.longitude,
        y: data.primaryLocation.latitude,
      }, // Assuming your schema accepts this object structure
      workingHours: data.workingHours,
      experienceYears: data.experienceYears,
      insuranceDetails: data.insuranceDetails,
    })
    .returning({ id: driver.id });

  return driverResult[0].id;
};

export interface IDriverRepository {
  create(driverData: DriverInput): Promise<number>;
  findByEmail(email: string): Promise<Driver | null>;
}

export const DriverRepository: IDriverRepository = {
  create,
  async findByEmail(email: string): Promise<Driver | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .where(eq(driver.email, email));
    return foundDriver || null;
  },

  // Add more methods as needed
};
