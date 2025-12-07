/**
 * This file defines the CourseCard component, which displays a summary of a course.
 * It includes the course title, content, author, and an image, as well as options to follow/unfollow and delete the course.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";
// Import server actions for following, unfollowing, and deleting a course.
import { followCourse, unfollowCourse, deleteCourse } from "@/actions/course.action";
// Import the useUser hook from Clerk to get the current user's data.
import { useUser } from "@clerk/nextjs";
import React from "react";
// Import UI components.
import { Card, CardContent } from "./ui/card";
import toast from "react-hot-toast";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
// Import a date formatting function.
import { formatDistanceToNow } from "date-fns";
// Import the delete confirmation dialog.
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
// Import the function to fetch courses to define the Course type.
import { getCourses } from "@/actions/course.action";

// Define the type for a single course, extending the type inferred from getCourses.
type Course = Awaited<ReturnType<typeof getCourses>>[number] & {
  followedBy: { id: string }[];
};

/**
 * The CourseCard component.
 * It displays a single course and its details.
 *
 * @param {object} props - The properties for the component.
 * @param {Course} props.course - The course object to display.
 * @param {string | null | undefined} props.dbUserId - The database ID of the current user.
 * @returns {JSX.Element} The JSX for the course card.
 */
function CourseCard({
  course,
  dbUserId,
}: {
  course: Course;
  dbUserId?: string | null;
}) {
  // Get the current user from Clerk.
  const { user } = useUser();
  // State to track if the current user is following the course.
  const [isFollowing, setIsFollowing] = React.useState(
    course.followedBy.some((follower) => follower.id === dbUserId)
  );
  // State for the number of followers.
  const [followers, setFollowers] = React.useState(course.followedBy.length);
  // State to track if an action (follow/unfollow/delete) is in progress.
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  /**
   * Handles the follow/unfollow action.
   */
  const handleFollow = async () => {
    // Prevent multiple submissions.
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (isFollowing) {
        // If already following, unfollow the course.
        await unfollowCourse(course.id);
        setFollowers((prev) => prev - 1);
      } else {
        // If not following, follow the course.
        await followCourse(course.id);
        setFollowers((prev) => prev + 1);
      }
      // Toggle the following state.
      setIsFollowing((prev) => !prev);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            {/* Link to the author's profile. */}
            <Link href={`/profile/${course.author.username}`}>
              <Avatar>
                <AvatarImage src={course.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  {/* Link to the author's profile with their name. */}
                  <Link
                    href={`/profile/${course.author.username}`}
                    className="font-semibold truncate"
                  >
                    {course.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {/* Link to the author's profile with their username. */}
                    <Link href={`/profile/${course.author.username}`}>
                      @{course.author.username}
                    </Link>
                    <span>•</span>
                    {/* Display the time since the course was created. */}
                    <span>
                      {formatDistanceToNow(new Date(course.createdAt))} ago
                    </span>
                  </div>
                </div>
                {/* Show the delete button if the current user is the author of the course. */}
                {dbUserId === course.author.id && (
                  <DeleteAlertDialog
                    isDeleting={isSubmitting}
                    onDelete={async () => {
                      try {
                        setIsSubmitting(true);
                        await deleteCourse(course.id);
                        toast.success("Course deleted successfully");
                      } catch (error) {
                        toast.error("Failed to delete course");
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  />
                )}
              </div>
              {/* Link to the detailed course page. */}
              <Link href={`/course/${course.id}`}>
                <h2 className="mt-2 text-lg font-semibold text-foreground break-words">
                  {course.title}
                </h2>
                <p className="mt-1 text-sm text-foreground break-words">
                  {course.content}
                </p>
              </Link>
            </div>
          </div>
          {/* Display the course image if it exists. */}
          {course.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={course.image}
                alt="Course content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="flex items-center pt-2 space-x-4">
            {/* Show the follow/unfollow button if the user is logged in. */}
            {user && (
              <Button
                variant={isFollowing ? "secondary" : "default"}
                size="sm"
                onClick={handleFollow}
                disabled={isSubmitting}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
            {/* Display the number of followers. */}
            <span className="text-sm text-muted-foreground">
              {followers} followers
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCard;
