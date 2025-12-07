/**
 * This file defines the Next.js middleware for the application.
 * It uses Clerk's middleware to handle authentication and protect routes.
 */
// Import the clerkMiddleware function from Clerk's Next.js server-side utilities.
import { clerkMiddleware } from '@clerk/nextjs/server';

// Export the clerkMiddleware as the default middleware.
// This will apply Clerk's authentication logic to all routes that match the `config.matcher`.
export default clerkMiddleware();

// Define the configuration for the middleware.
export const config = {
  // The `matcher` array specifies which paths the middleware should run on.
  matcher: [
    // This pattern skips Next.js internal routes and static files.
    // It ensures that the middleware does not run unnecessarily on assets or internal Next.js mechanisms.
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // This pattern explicitly includes all API routes (starting with /api or /trpc).
    // This ensures that API endpoints are protected by Clerk's authentication.
    '/(api|trpc)(.*)',
  ],
};
