"use server";

import prisma from "@/lib/prisma";

interface CreateUserResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export const createUser = async (
  email: string
): Promise<CreateUserResponse> => {
  if (!email) {
    return {
      success: false,
      error: "Email is required",
    };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "User already exists",
        user: existingUser,
      };
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email,
      },
    });

    // Ensure the response is serializable
    return {
      success: true,
      user: JSON.parse(JSON.stringify(newUser)),
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
};
