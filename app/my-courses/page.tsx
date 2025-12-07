/**
 * This file defines the "My Courses" page, which allows users to see the courses they are participating in
 * and the courses they have created. It uses a tabbed interface to switch between these two views.
 */

// Import UI components for tabs.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import the component for displaying a single course.
import CourseCard from "@/components/CourseCard";
// Import functions to fetch the user's created and participating courses.
import { getCreatedCourses, getParticipatingCourses } from "@/actions/course.action";
// Import the function to get the database ID of the current user.
import { getDbUserId } from "@/actions/user.action";

/**
 * The MyCoursesPage component.
 * It fetches and displays the courses created by and participated in by the current user.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the JSX for the "My Courses" page.
 */
export default async function MyCoursesPage() {
  // Fetch the courses the user is participating in.
  const participatingCourses = await getParticipatingCourses();
  // Fetch the courses the user has created.
  const createdCourses = await getCreatedCourses();
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      {/* The main tabs component to switch between "Participating" and "Created" courses. */}
      <Tabs defaultValue="participating" className="w-full">
        {/* The list of tab triggers. */}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participating">Participating Courses</TabsTrigger>
          <TabsTrigger value="created">Created Courses</TabsTrigger>
        </TabsList>
        {/* The content for the "Participating Courses" tab. */}
        <TabsContent value="participating" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Map through the participating courses and render a CourseCard for each. */}
            {participatingCourses.map((course) => (
              <CourseCard key={course.id} course={course} dbUserId={dbUserId} />
            ))}
          </div>
          {/* Display a message if the user is not participating in any courses. */}
          {participatingCourses.length === 0 && (
            <p className="text-center text-muted-foreground">
              You are not participating in any courses yet.
            </p>
          )}
        </TabsContent>
        {/* The content for the "Created Courses" tab. */}
        <TabsContent value="created" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Map through the created courses and render a CourseCard for each. */}
            {createdCourses.map((course) => (
              <CourseCard key={course.id} course={course} dbUserId={dbUserId} />
            ))}
          </div>
          {/* Display a message if the user has not created any courses. */}
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