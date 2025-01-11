"use server";

import prisma from "@/lib/prisma";

export const createUser = async (user: any) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: user,
      },
    });
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.log(error);
  }
};
