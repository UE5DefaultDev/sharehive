/**
 * This file defines the CommentSection component, which allows users to view and add comments to a course.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";

import { addComment } from "@/actions/comment.action";

import { useUser } from "@clerk/nextjs";

import { useState } from "react";
// Import the toast library for displaying notifications.
import toast from "react-hot-toast";

// Import UI components.
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage } from "./ui/avatar";

import { formatDistanceToNow } from "date-fns";

import Link from "next/link";

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

interface CommentSectionProps {
  courseId: string;
  comments: Comment[];
}

export function CommentSection({ courseId, comments }: CommentSectionProps) {
  // Get the current user from Clerk.
  const { user } = useUser();

  const [comment, setComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Do not submit if the comment is empty.
    if (!comment.trim()) return;

    try {
      // Set submitting state to true to disable the button.
      setIsSubmitting(true);
      await addComment(courseId, comment);
      // Clear the comment input field.
      setComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Comments</h3>
      </div>
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
            <Link href={`/profile/${comment.author.username}`}>
              <Avatar>
                <AvatarImage src={comment.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="font-semibold"
                >
                  {comment.author.name}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
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
