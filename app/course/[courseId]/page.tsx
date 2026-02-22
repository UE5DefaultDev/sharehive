// Displays detailed course information and comments.
import { getCourseById } from "@/actions/course.action";
import { CommentSection } from "@/components/CommentSection";
import CourseCard from "@/components/CourseCard";
import { getDbUserId } from "@/actions/user.action";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

async function CoursePage({ params }: { params: { courseId: string } }) {
  const course = await getCourseById(params.courseId);
  const dbUserId = await getDbUserId();

  if (!course) {
    notFound();
  }

  const comments = await prisma.comment.findMany({
    where: {
      courseId: params.courseId,
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <CourseCard course={course} dbUserId={dbUserId} />
      <div className="mt-8">
        <CommentSection courseId={params.courseId} comments={comments} />
      </div>
    </div>
  );
}

export default CoursePage;
