/**
 * This file defines the CommentSection component, which allows users to view and add comments to a course.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";

// Import the server action for adding a comment.
import { addComment } from "@/actions/comment.action";
// Import the useUser hook from Clerk to get the current user's data.
import { useUser } from "@clerk/nextjs";
// Import React hooks for state management.
import { useState } from "react";
// Import the toast library for displaying notifications.
import toast from "react-hot-toast";
// Import UI components.
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage } from "./ui/avatar";
// Import a date formatting function.
import { formatDistance } from "date-fns";
// Import the Link component for navigation.
import Link from "next/link";

// Define the type for a single comment.
type Comment = {
  id: string;
  text: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
};

// Define the props for the CommentSection component.
interface CommentSectionProps {
  courseId: string;
  comments: Comment[];
}

/**
 * The CommentSection component.
 * It displays a list of comments and a form for adding new comments.
 *
 * @param {CommentSectionProps} props - The properties for the component.
 * @returns {JSX.Element} The JSX for the comment section.
 */
export function CommentSection({ courseId, comments }: CommentSectionProps) {
  // Get the current user from Clerk.
  const { user } = useUser();
  // State for the new comment text.
  const [comment, setComment] = useState("");
  // State to track if the comment is being submitted.
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles the submission of a new comment.
   */
  const handleSubmit = async () => {
    // Do not submit if the comment is empty.
    if (!comment.trim()) return;

    try {
      // Set submitting state to true to disable the button.
      setIsSubmitting(true);
      // Call the server action to add the comment.
      await addComment(courseId, comment);
      // Clear the comment input field.
      setComment("");
      // Show a success notification.
      toast.success("Comment added successfully");
    } catch (error) {
      // Show an error notification if the submission fails.
      toast.error("Failed to add comment");
    } finally {
      // Reset the submitting state.
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Comments</h3>
      </div>
      {/* Only show the comment form if the user is logged in. */}
      {user && (
        <div className="flex flex-col gap-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
            className="self-end"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      )}

      {/* Display the list of comments. */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            {/* Link to the author's profile. */}
            <Link href={`/profile/${comment.author.username}`}>
              <Avatar>
                <AvatarImage src={comment.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {/* Link to the author's profile with their name. */}
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="font-semibold"
                >
                  {comment.author.name}
                </Link>
                {/* Display the time since the comment was posted. */}
                <span className="text-sm text-muted-foreground">
                  {formatDistance(new Date(comment.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
