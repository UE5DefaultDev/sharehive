"use server";

import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";

/**
 * Creates a new message in a course chat.
 *
 * @param courseId - The ID of the course.
 * @param content - The content of the message.
 * @throws Will throw an error if the user is not found.
 */
export async function createMessage(courseId: string, content: string) {
  const dbUserId = await getDbUserId();

  if (!dbUserId) throw new Error("User not found");

  await prisma.message.create({
    data: {
      content,
      courseId,
      authorId: dbUserId,
    },
  });

  revalidatePath(`/chats/${courseId}`);
}

/**
 * Retrieves messages for a specific course.
 *
 * @param courseId - The ID of the course.
 * @returns A promise that resolves to an array of messages with their authors.
 */
export async function getCourseMessages(courseId: string) {
  return prisma.message.findMany({
    where: {
      courseId,
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Retrieves encrypted message deliveries for a specific course for the current user.
 *
 * @param courseId - The ID of the course.
 * @returns A promise that resolves to an array of encrypted payloads.
 */
export async function getEncryptedCourseMessages(courseId: string) {
  const dbUserId = await getDbUserId();
  if (!dbUserId) return [];

  const deliveries = await prisma.messageDelivery.findMany({
    where: {
      recipientUserId: dbUserId,
      message: {
        courseId,
      },
    },
    orderBy: {
      message: {
        createdAt: "asc",
      },
    },
  });

  return deliveries.map((d) => JSON.parse(d.encryptedPayloadJson));
}
