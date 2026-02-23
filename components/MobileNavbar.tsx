/**
 * This file defines the MobileNavbar component, which is the navigation bar for mobile screens.
 * It includes a theme toggle button and a slide-out menu with navigation links.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";

import {
  BellIcon,
  CompassIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareText,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useState } from "react";

import { useAuth, SignInButton, SignOutButton } from "@clerk/nextjs";

import { useTheme } from "next-themes";
import Link from "next/link";
import { ChatList } from "./ChatList";
import { SidebarProvider } from "./ui/sidebar";

type Course = {
  id: string;
  title: string;
};

function MobileNavbar({ courses = [] }: { courses?: Course[] }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Get the user's authentication status from Clerk.
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    // The main container for the mobile Chatbar, hidden on larger screens.
    <div className="flex md:hidden items-center space-x-2">
      {isSignedIn && (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <MessageSquareText className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh]">
            <div className="mx-auto w-full max-w-sm h-full flex flex-col">
              <DrawerHeader>
                <DrawerTitle>Chats</DrawerTitle>
                <DrawerDescription>Select a course chat.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-8 flex-1 overflow-auto">
                <SidebarProvider className="min-h-fit">
                  <ChatList courses={courses} />
                </SidebarProvider>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

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
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        {/* Content of the slide-out menu. */}
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            {/* The discover page link. */}
            <Button
              variant="ghost"
              className="flex items-center gap-3 justify-start"
              asChild
            >
              <Link href="/discover">
                <CompassIcon className="w-4 h-4" />
                Discover
              </Link>
            </Button>

            {/* Conditionally render links for authenticated users. */}
            {isSignedIn ? (
              <>
                {/* The notifications page link. */}
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start"
                  asChild
                >
                  <Link href="/notifications">
                    <BellIcon className="w-4 h-4" />
                    Notifications
                  </Link>
                </Button>
                {/* The profile page link. */}
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start"
                  asChild
                >
                  <Link href="/profile">
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                </Button>
                {/* The sign-out button. */}
                <SignOutButton>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 justify-start w-full"
                  >
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
