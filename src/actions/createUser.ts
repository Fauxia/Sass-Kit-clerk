"use server";

import prisma from "@/lib/prisma";

interface CreateUserResponse {
  success: boolean;
  user?: any;
  error?: string;
  debug?: any;
}

export const createUser = async (
  email: string
): Promise<CreateUserResponse> => {
  console.log("Creating user with email:", email); // Debug log

  if (!email) {
    console.log("No email provided");
    return {
      success: false,
      error: "Email is required",
    };
  }

  try {
    // Debug log for database connection
    console.log("Attempting database connection...");

    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully");

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return {
        success: false,
        error: "User already exists",
        user: existingUser,
      };
    }

    // Create new user
    console.log("Attempting to create new user...");
    const newUser = await prisma.user.create({
      data: {
        email: email,
      },
    });
    console.log("User created successfully:", newUser);

    // Ensure the response is serializable
    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error("Detailed error creating user:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
      debug: {
        errorDetails: error,
        prismaUrl: process.env.DATABASE_URL?.split("@")[1], // Only log the host part, not credentials
      },
    };
  } finally {
    // Always disconnect
    await prisma.$disconnect();
  }
};
