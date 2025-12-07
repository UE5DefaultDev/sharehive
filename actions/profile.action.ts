/**
 * This file contains server-side actions for managing user profiles.
 * It uses the 'use server' directive to indicate that the code should only run on the server.
 */
"use server";

// Import the Prisma client for database interactions.
import prisma from "@/lib/prisma";
// Import the auth function from Clerk to get the current user's authentication status.
import { auth } from "@clerk/nextjs/server";
// Import the revalidatePath function from next/cache to invalidate the cache for specific paths.
import { revalidatePath } from "next/cache";

/**
 * Retrieves a user's profile by their username.
 *
 * @param username - The username of the user to retrieve.
 * @returns A promise that resolves to the user's profile object, or null if not found.
 * @throws Will throw an error if fetching the profile fails.
 */
export async function getProfileByUsername(username: string) {
  try {
    // Use the Prisma client to find a unique user by their username.
    const user = await prisma.user.findUnique({
      where: { username: username },
      // Select the fields to include in the returned user object.
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
        // Count the number of courses created and followed by the user.
        _count: {
          select: {
            coursesCreated: true,
            followedCourses: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    // Log the error and re-throw a more generic error to the client.
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

/**
 * Retrieves all courses created by a specific user.
 *
 * @param userId - The ID of the user whose courses to retrieve.
 * @returns A promise that resolves to an array of courses.
 * @throws Will throw an error if fetching the courses fails.
 */
export async function getUserCourses(userId: string) {
  try {
    // Use the Prisma client to find all courses where the authorId matches the given userId.
    const courses = await prisma.course.findMany({
      where: {
        authorId: userId,
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

    return courses;
  } catch (error) {
    // Log the error and re-throw a more generic error to the client.
    console.error("Error fetching user courses:", error);
    throw new Error("Failed to fetch user courses");
  }
}

/**
 * Retrieves all courses followed by a specific user.
 *
 * @param userId - The ID of the user whose followed courses to retrieve.
 * @returns A promise that resolves to an array of courses.
 * @throws Will throw an error if fetching the followed courses fails.
 */
export async function getUserFollowedCourses(userId: string) {
  try {
    // Use the Prisma client to find the user by their ID.
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      // Include the courses the user is following.
      include: {
        followedCourses: {
          // For each followed course, include its author and followers.
          include: {
            author: true,
            followedBy: true,
          },
        },
      },
    });

    // Return the followed courses, or an empty array if the user is not found or follows no courses.
    return user?.followedCourses ?? [];
  } catch (error) {
    // Log the error and re-throw a more generic error to the client.
    console.error("Error fetching followed courses:", error);
    throw new Error("Failed to fetch followed courses");
  }
}

/**
 * Updates the profile of the currently authenticated user.
 *
 * @param formData - The form data containing the updated profile information.
 * @returns A promise that resolves to an object indicating success or failure.
 * @throws Will throw an error if the user is not authenticated.
 */
export async function updateProfile(formData: FormData) {
  try {
    // Get the Clerk ID of the currently authenticated user.
    const { userId: clerkId } = await auth();
    // If there is no clerkId, the user is not authenticated.
    if (!clerkId) throw new Error("Unauthorized");

    // Extract the profile data from the form data.
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    // Use the Prisma client to update the user's profile in the database.
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name,
        bio,
        location,
        website,
      },
    });

    // Revalidate the cache for the profile page to show the updated information.
    revalidatePath("/profile");
    // Return a success response with the updated user data.
    return { success: true, user };
  } catch (error) {
    // Log the error and return a failure response.
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
