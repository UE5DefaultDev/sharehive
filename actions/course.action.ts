/**
 * This file contains server-side actions for managing courses.
 * It uses the 'use server' directive to indicate that the code should only run on the server.
 */
"use server";

// Import the revalidatePath function from next/cache to invalidate the cache for specific paths.
import { revalidatePath } from "next/cache";
// Import the getDbUserId function to get the database ID of the current user.
import { getDbUserId } from "./user.action";
// Import the Prisma client for database interactions.
import prisma from "@/lib/prisma";

/**
 * Creates a new course.
 *
 * @param values - An object containing the title, content, and image for the new course.
 * @throws Will throw an error if the user is not found.
 */
export async function createCourse(
  values: Record<"title" | "content" | "image", string>
) {
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  // If the user ID is not found, it means the user is not authenticated.
  // Throw an error to prevent further execution.
  if (!dbUserId) throw new Error("User not found");

  // Use the Prisma client to create a new course in the database.
  await prisma.course.create({
    data: {
      // The ID of the user who authored the course.
      authorId: dbUserId,
      // Spread the values object to set the title, content, and image of the course.
      ...values,
    },
  });

  // After creating the course, revalidate the cache for the home page.
  // This ensures that the new course is immediately visible to all users.
  revalidatePath("/");
}

/**
 * Retrieves all courses from the database.
 *
 * @param query - An optional search query to filter courses by title or content.
 * @returns A promise that resolves to an array of courses, including their authors and followers.
 */
export async function getCourses(query?: string) {
  // Use the Prisma client to find all courses.
  return prisma.course.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        }
      : {},
    // Include the related author and followedBy (followers) data for each course.
    include: {
      author: true,
      followedBy: true,
    },
    // Order the courses by their creation date in descending order (newest first).
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Retrieves a single course by its ID.
 *
 * @param id - The ID of the course to retrieve.
 * @returns A promise that resolves to the course object, or null if not found.
 */
export async function getCourseById(id: string) {
  // Use the Prisma client to find a unique course by its ID.
  return prisma.course.findUnique({
    where: {
      id,
    },
    // Include the related author and followedBy (followers) data for the course.
    include: {
      author: true,
      followedBy: true,
    },
  });
}

/**
 * Allows the current user to follow a course.
 *
 * @param courseId - The ID of the course to follow.
 * @throws Will throw an error if the user is not found.
 */
export async function followCourse(courseId: string) {
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  // If the user ID is not found, it means the user is not authenticated.
  // Throw an error to prevent further execution.
  if (!dbUserId) throw new Error("User not found");

  // Use the Prisma client to update the course.
  await prisma.course.update({
    where: {
      id: courseId,
    },
    // The data to update.
    data: {
      // Add the current user to the list of followers for the course.
      followedBy: {
        connect: {
          id: dbUserId,
        },
      },
    },
  });

  // After following the course, revalidate the cache for the home page.
  revalidatePath("/");
}

/**
 * Allows the current user to unfollow a course.
 *
 * @param courseId - The ID of the course to unfollow.
 * @throws Will throw an error if the user is not found.
 */
export async function unfollowCourse(courseId: string) {
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  // If the user ID is not found, it means the user is not authenticated.
  // Throw an error to prevent further execution.
  if (!dbUserId) throw new Error("User not found");

  // Use the Prisma client to update the course.
  await prisma.course.update({
    where: {
      id: courseId,
    },
    // The data to update.
    data: {
      // Remove the current user from the list of followers for the course.
      followedBy: {
        disconnect: {
          id: dbUserId,
        },
      },
    },
  });

  // After unfollowing the course, revalidate the cache for the home page.
  revalidatePath("/");
}

/**
 * Deletes a course. Only the author of the course can delete it.
 *
 * @param courseId - The ID of the course to delete.
 * @throws Will throw an error if the user is not found, or if the user is not the author of the course.
 */
export async function deleteCourse(courseId: string) {
    // Get the database ID of the currently logged-in user.
    const dbUserId = await getDbUserId();
  
    // If the user ID is not found, it means the user is not authenticated.
    // Throw an error to prevent further execution.
    if (!dbUserId) throw new Error("User not found");
  
    // Find the course to be deleted to check for authorization.
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      // Select only the authorId for efficiency.
      select: {
        authorId: true,
      },
    });
  
    // If the author of the course is not the current user, throw an error.
    if (course?.authorId !== dbUserId) throw new Error("Unauthorized");
  
    // Use the Prisma client to delete the course.
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });
  
    // After deleting the course, revalidate the cache for the home page.
    revalidatePath("/");
  }

/**
 * Retrieves all courses that the current user is participating in (following).
 *
 * @returns A promise that resolves to an array of courses.
 * @throws Will throw an error if the user is not found.
 */
export async function getParticipatingCourses() {
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  // If the user ID is not found, it means the user is not authenticated.
  // Throw an error to prevent further execution.
  if (!dbUserId) throw new Error("User not found");

  // Use the Prisma client to find all courses where the current user is a follower.
  return prisma.course.findMany({
    where: {
      followedBy: {
        some: {
          id: dbUserId,
        },
      },
    },
    // Include the related author and followedBy (followers) data for each course.
    include: {
      author: true,
      followedBy: true,
    },
    // Order the courses by their creation date in descending order (newest first).
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Retrieves all courses created by the current user.
 *
 * @returns A promise that resolves to an array of courses.
 * @throws Will throw an error if the user is not found.
 */
export async function getCreatedCourses() {
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  // If the user ID is not found, it means the user is not authenticated.
  // Throw an error to prevent further execution.
  if (!dbUserId) throw new Error("User not found");

  // Use the Prisma client to find all courses where the current user is the author.
  return prisma.course.findMany({
    where: {
      authorId: dbUserId,
    },
    // Include the related author and followedBy (followers) data for each course.
    include: {
      author: true,
      followedBy: true,
    },
    // Order the courses by their creation date in descending order (newest first).
    orderBy: {
      createdAt: "desc",
    },
  });
}
