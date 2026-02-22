/**
 * This file defines the DesktopNavbar component, which is the navigation bar for desktop screens.
 * It includes links to the home page, notifications, and profile, as well as a sign-in button and user profile button.
 */

import { BellIcon, HomeIcon, MessageSquareText, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { SignInButton, UserButton } from "@clerk/nextjs";

import { ModeToggle } from "./ui/mode-toggle";

import { currentUser } from "@clerk/nextjs/server";

/**
 * The DesktopNavbar component.
 * It renders the navigation bar for desktop views.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the JSX for the desktop navigation bar.
 */
async function DesktopNavbar() {
  // Get the current user from Clerk.
  const user = await currentUser();

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      {/* The home page link. */}
      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {/* Conditionally render links for authenticated users. */}
      {user ? (
        <>
          {/* The notifications page link. */}
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          {/* The chats page link. */}
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/chats">
              <MessageSquareText className="w-4 h-4" />
              <span className="hidden lg:inline">Chats</span>
            </Link>
          </Button>
          {/* The profile page link. */}
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${
                // Use the username or generate one from the email address.
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          {/* The Clerk UserButton for managing the user's account. */}
          <UserButton />
        </>
      ) : (
        // If the user is not authenticated, show a sign-in button.
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;
