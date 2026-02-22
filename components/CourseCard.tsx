/**
 * This file defines the CourseCard component, which displays a summary of a course.
 * It includes the course title, content, author, and an image, as well as options to follow/unfollow and delete the course.
 */
"use client";

import {
  followCourse,
  unfollowCourse,
  deleteCourse,
} from "@/actions/course.action";
import { useUser } from "@clerk/nextjs";
import React from "react";
// Import UI components.
import { Card, CardContent } from "./ui/card";
import toast from "react-hot-toast";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";

import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import { getCourses } from "@/actions/course.action";

type Course = Awaited<ReturnType<typeof getCourses>>[number] & {
  followedBy: { id: string }[];
};

function CourseCard({
  course,
  dbUserId,
}: {
  course: Course;
  dbUserId?: string | null;
}) {
  // Get the current user from Clerk.
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = React.useState(
    course.followedBy.some((follower) => follower.id === dbUserId),
  );
  const [followers, setFollowers] = React.useState(course.followedBy.length);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleFollow = async () => {
    // Prevent multiple submissions.
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (isFollowing) {
        await unfollowCourse(course.id);
        setFollowers((prev) => prev - 1);
      } else {
        await followCourse(course.id);
        setFollowers((prev) => prev + 1);
      }
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
            <Link href={`/profile/${course.author.username}`}>
              <Avatar>
                <AvatarImage src={course.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${course.author.username}`}
                    className="font-semibold truncate"
                  >
                    {course.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${course.author.username}`}>
                      @{course.author.username}
                    </Link>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(course.createdAt))} ago
                    </span>
                  </div>
                </div>
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
