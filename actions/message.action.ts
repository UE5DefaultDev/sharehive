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
 * Retrieves new messages for a specific course created after a given timestamp.
 *
 * @param courseId - The ID of the course.
 * @param after - The timestamp to fetch messages after.
 * @returns A promise that resolves to an array of new messages.
 */
export async function getNewMessages(courseId: string, after: string) {
  return prisma.message.findMany({
    where: {
      courseId,
      createdAt: {
        gt: new Date(after),
      },
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
