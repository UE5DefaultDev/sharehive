/**
 * This file defines the MobileNavbar component, which is the navigation bar for mobile screens.
 * It includes a theme toggle button and a slide-out menu with navigation links.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";

// Import icons from lucide-react.
import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
// Import UI components.
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// Import React hooks for state management.
import { useState } from "react";
// Import Clerk hooks for authentication.
import { useAuth, SignInButton, SignOutButton } from "@clerk/nextjs";
// Import the useTheme hook from next-themes for theme management.
import { useTheme } from "next-themes";
import Link from "next/link";

/**
 * The MobileNavbar component.
 * It renders the navigation bar for mobile views, including a theme toggle and a slide-out menu.
 *
 * @returns {JSX.Element} The JSX for the mobile navigation bar.
 */
function MobileNavbar() {
  // State to control the visibility of the mobile menu.
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Get the user's authentication status from Clerk.
  const { isSignedIn } = useAuth();
  // Get the current theme and the function to change it.
  const { theme, setTheme } = useTheme();

  return (
    // The main container for the mobile navbar, hidden on larger screens.
    <div className="flex md:hidden items-center space-x-2">
      {/* The theme toggle button. */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mr-2"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* The slide-out menu (Sheet) for mobile navigation. */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        {/* The trigger for the menu, which is a button with a menu icon. */}
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        {/* The content of the slide-out menu. */}
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            {/* The home page link. */}
            <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
              <Link href="/">
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
            </Button>

            {/* Conditionally render links for authenticated users. */}
            {isSignedIn ? (
              <>
                {/* The notifications page link. */}
                <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
                  <Link href="/notifications">
                    <BellIcon className="w-4 h-4" />
                    Notifications
                  </Link>
                </Button>
                {/* The profile page link. */}
                <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
                  <Link href="/profile">
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                </Button>
                {/* The sign-out button. */}
                <SignOutButton>
                  <Button variant="ghost" className="flex items-center gap-3 justify-start w-full">
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              // If the user is not authenticated, show a sign-in button.
              <SignInButton mode="modal">
                <Button variant="default" className="w-full">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
