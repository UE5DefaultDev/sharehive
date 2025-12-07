/**
 * This file contains server-side actions for managing users.
 * It uses the 'use server' directive to indicate that the code should only run on the server.
 */
"use server";

// Import the Prisma client for database interactions.
import prisma from "@/lib/prisma";
// Import the auth and currentUser functions from Clerk to get the current user's authentication status and data.
import { auth, currentUser } from "@clerk/nextjs/server";


/**
 * Synchronizes the user data from Clerk to the local database.
 * If the user does not exist in the database, it creates a new user.
 *
 * @returns A promise that resolves to the user object from the database, or undefined if an error occurs.
 */
export async function syncUser() {
    try {
        // Get the Clerk ID of the currently authenticated user.
        const {userId} = await auth();
        // Get the full user object from Clerk.
        const user = await currentUser();

        // If there is no userId or user object, the user is not authenticated or there's an issue with Clerk.
        if (!userId || !user) return;

        // Check if the user already exists in the local database.
        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            }
        });

        // If the user already exists, return the existing user data.
        if (existingUser) return existingUser;

        // If the user does not exist, create a new user in the database.
        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                // Use the username from Clerk, or generate one from the email address.
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            }
        })

        // Return the newly created user.
        return dbUser;

    } catch (error) {
        // Log any errors that occur during the process.
        console.log("Error syncing user:", error);
    }
}

/**
 * Retrieves a user from the database by their Clerk ID.
 *
 * @param clerkId - The Clerk ID of the user to retrieve.
 * @returns A promise that resolves to the user object, or null if not found.
 */
export async function getUserByClerkId(clerkId: string) {
    // Use the Prisma client to find a unique user by their Clerk ID.
    return prisma.user.findUnique({
        where: {
            clerkId,
            },
        // Include the count of created courses and comments for the user.
        include: {
            _count: {
                select: {
                    coursesCreated: true,
                    comments: true,
                }
            }
        }
        
    }
    );

}

/**
 * Retrieves all users from the database.
 *
 * @returns A promise that resolves to an array of all users.
 */
export async function getUsers() {
    // Use the Prisma client to find all users.
    return prisma.user.findMany();
}


/**
 * Retrieves the database ID of the currently authenticated user.
 *
 * @returns A promise that resolves to the user's database ID, or null if the user is not authenticated.
 * @throws Will throw an error if the user is authenticated but not found in the database.
 */
export async function getDbUserId() {
    // Get the Clerk ID of the currently authenticated user.
    const {userId:clerkId} = await auth();
    // If there is no clerkId, the user is not authenticated.
    if (!clerkId) return null;

    // Get the user from the database using their Clerk ID.
    const user = await getUserByClerkId(clerkId);

    // If the user is not found in the database, throw an error.
    if (!user) throw new Error("User not found");

    // Return the user's database ID.
    return user.id;
}
