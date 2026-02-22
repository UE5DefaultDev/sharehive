/*
Displays a sidebar containing chats for courses the user is participating in.
*/

import { getParticipatingCourses } from "@/actions/course.action";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { MessageSquare } from "lucide-react";
import { ChatList } from "./ChatList";

export async function DesktopChatBar() {
  let courses: Awaited<ReturnType<typeof getParticipatingCourses>> = [];
  try {
    courses = await getParticipatingCourses();
  } catch (error) {
    console.error("Failed to fetch courses for ChatBar:", error);
  }

  return (
    <Sidebar className="hidden md:block absolute h-full border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Chats</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Course Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <ChatList courses={courses} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
