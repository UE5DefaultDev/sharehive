"use client";

import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Define a simplified Course type or import it if available.
// Based on getParticipatingCourses, it returns Prisma course object.
type Course = {
    id: string;
    title: string;
    // other fields are not used here
};

export function ChatList({ courses }: { courses: Course[] }) {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {courses.map((course) => {
                const isActive = pathname === `/chats/${course.id}`;
                return (
                    <SidebarMenuItem key={course.id}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            className={cn(isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                        >
                            <Link href={`/chats/${course.id}`}>
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                                    {course.title.charAt(0)}
                                </div>
                                <span>{course.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
            {courses.length === 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                    No courses followed yet.
                </div>
            )}
        </SidebarMenu>
    );
}
