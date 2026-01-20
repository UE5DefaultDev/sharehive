import { getCourseById } from "@/actions/course.action";
import { getCourseMessages } from "@/actions/message.action";
import { getDbUserId } from "@/actions/user.action";
import { ChatInterface } from "@/components/ChatInterface";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { notFound } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  const dbUserId = await getDbUserId();

  if (!course || !dbUserId) {
    if (!course) notFound();
    return null; // Or redirect to login
  }

  const messages = await getCourseMessages(courseId);

  return (
    <div className="flex h-full w-full flex-col bg-background/50">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card shadow-sm z-10">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {course.title.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {course.title} Chat
          </h1>
        </div>
      </div>

      <ChatInterface 
        courseId={courseId} 
        initialMessages={messages} 
        currentUserId={dbUserId} 
      />
    </div>
  );
}