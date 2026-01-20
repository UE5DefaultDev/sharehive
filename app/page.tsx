/**
 * This file represents the main homepage of the application.
 * It displays a feed of courses and provides an option to create a new course for authenticated users.
 *
 * The layout is structured as follows:
 * - Large Screen Layout:
 *   - Left: User's profile information (handled by Sidebar.tsx, integrated in layout.tsx).
 *   - Center: A feed of course cards (CourseCard.tsx), with a course creation component (CreateCourse.tsx) at the top for logged-in users.
 *   - Right: A section for notifications (currently a placeholder).
 */

// Import the function to fetch all courses.
import { getCourses } from "@/actions/course.action";
// Import the component for displaying a single course.
import CourseCard from "@/components/CourseCard";
// Import the component for creating a new course.
import CreateCourse from "@/components/CreateCourse";
// Import the function to get the currently authenticated user from Clerk.
import { currentUser } from "@clerk/nextjs/server";
// Import the function to get the database ID of the current user.
import { getDbUserId } from "@/actions/user.action";
import Sidebar from "@/components/Sidebar";

/**
 * The Home component for the main page.
 * It fetches all courses and the current user's data to render the homepage.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the JSX for the homepage.
 */
export default async function Home() {
  // Fetch the current user's data from Clerk.
  const user = await currentUser();
  // Fetch all courses from the database.
  const courses = await getCourses();
  // Get the database ID of the currently logged-in user.
  const dbUserId = await getDbUserId();

  return (
    // The main grid layout for the homepage.
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-3">
          <Sidebar />
        </div>
        {/* The central column for the course feed. */}
        <div className="lg:col-span-6">
          {/* Conditionally render the CreateCourse component if a user is logged in. */}
          {user ? <CreateCourse /> : null}

          {/* The feed of courses. */}
          <div className="space-y-6">
            {/* Map through the fetched courses and render a CourseCard for each one. */}
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} dbUserId={dbUserId} />
            ))}
          </div>
        </div>

        {/* The right-side column for notifications, hidden on smaller screens. */}
        <div className="hidden lg:col-span-4 lg:block sticky top-20">
          Notifications
        </div>
      </div>
    </div>
  );
}
