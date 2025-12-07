/**
 * This file contains the server-side action for adding a comment to a course.
 * It uses the 'use server' directive to indicate that the code should only run on the server.
 */
"use server";

// Import the Prisma client for database interactions.
import prisma from "@/lib/prisma";
// Import the revalidatePath function from next/cache to invalidate the cache for a specific path.
import { revalidatePath } from "next/cache";
// Import the getDbUserId function to get the database ID of the current user.
import { getDbUserId } from "./user.action";

/**
 * Adds a comment to a specific course.
 *
 * @param courseId - The ID of the course to add the comment to.
 * @param text - The text content of the comment.
 * @throws Will throw an error if the user is not found.
 */
export async function addComment(courseId: string, text: string) {
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  // If the user ID is not found, it means the user is not authenticated.
  // Throw an error to prevent further execution.
  if (!dbUserId) throw new Error("User not found");

  // Use the Prisma client to create a new comment in the database.
  await prisma.comment.create({
    // The data for the new comment.
    data: {
      // The text of the comment.
      text,
      // The ID of the user who authored the comment.
      authorId: dbUserId,
      // The ID of the course the comment belongs to.
      courseId,
    },
  });

  // After adding the comment, revalidate the cache for the course page.
  // This ensures that the new comment is immediately visible to all users.
  revalidatePath(`/courses/${courseId}`);
}
