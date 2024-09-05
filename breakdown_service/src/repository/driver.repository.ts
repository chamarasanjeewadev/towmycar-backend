import { eq } from "drizzle-orm";
import { DB } from "../db/db.connection"; // Assuming you have a db connection file
import { driver, Driver } from "../db/schema/schema";
import { DriverInput } from "../dto/driver.dto";

export interface IDriverRepository {
  create(driverData: DriverInput): Promise<Driver>;
  findByEmail(email: string): Promise<Driver | null>;
}

export const DriverRepository: IDriverRepository = {
  async create(driverData: DriverInput): Promise<Driver> {
    const [newDriver] = await DB.insert(driver).values(driverData).returning();
    return newDriver;
  },

  async findByEmail(email: string): Promise<Driver | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .where(eq(driver.email, email));
    return foundDriver || null;
  },

  // Add more methods as needed
};
