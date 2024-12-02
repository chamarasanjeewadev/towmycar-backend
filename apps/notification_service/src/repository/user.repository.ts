import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface User {
  id: number;
  phoneNumber?: string;
  // ... other user fields
}

export const UserRepository = {
  async findById(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          phoneNumber: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },
}; 