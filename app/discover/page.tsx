import { getCourses } from "@/actions/course.action";
import CourseCard from "@/components/CourseCard";
import CreateCourse from "@/components/CreateCourse";
import { currentUser } from "@clerk/nextjs/server";
import { getDbUserId } from "@/actions/user.action";
import Sidebar from "@/components/Sidebar";
import CourseSearch from "@/components/CourseSearch";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const user = await currentUser();
  const courses = await getCourses(query);
  const dbUserId = await getDbUserId();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-3">
          <Sidebar />
        </div>
        <div className="lg:col-span-6">
          <CourseSearch />
          {user ? <CreateCourse /> : null}

          <div className="space-y-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  dbUserId={dbUserId}
                />
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No courses found.
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:col-span-4 lg:block sticky top-20">
          Notifications
        </div>
      </div>
    </div>
  );
}
