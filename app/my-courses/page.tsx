// Displays courses created by and participated in by the user.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/CourseCard";
import { getCreatedCourses, getParticipatingCourses } from "@/actions/course.action";
import { getDbUserId } from "@/actions/user.action";

export default async function MyCoursesPage() {
  const participatingCourses = await getParticipatingCourses();
  const createdCourses = await getCreatedCourses();
  const dbUserId = await getDbUserId();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      <Tabs defaultValue="participating" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participating">Participating Courses</TabsTrigger>
          <TabsTrigger value="created">Created Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="participating" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {participatingCourses.map((course) => (
              <CourseCard key={course.id} course={course} dbUserId={dbUserId} />
            ))}
          </div>
          {participatingCourses.length === 0 && (
            <p className="text-center text-muted-foreground">
              You are not participating in any courses yet.
            </p>
          )}
        </TabsContent>
        <TabsContent value="created" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {createdCourses.map((course) => (
              <CourseCard key={course.id} course={course} dbUserId={dbUserId} />
            ))}
          </div>
          {createdCourses.length === 0 && (
            <p className="text-center text-muted-foreground">
              You have not created any courses yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
