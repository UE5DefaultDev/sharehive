/**
 * This file defines the CreateCourse component, which provides a form for users to create a new course.
 * It includes fields for a title, content, and an optional image upload.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";
import { useUser } from "@clerk/nextjs";
import React from "react";
// Import UI components.
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";

import { createCourse } from "@/actions/course.action";
import toast from "react-hot-toast";

import ImageUpload from "./ImageUpload";
import { Input } from "./ui/input";

/**
 * The CreateCourse component.
 * It renders a form for creating a new course.
 *
 * @returns {JSX.Element} The JSX for the create course form.
 */
function CreateCourse() {
  // Get the current user from Clerk.
  const { user } = useUser();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);
  const [showImageUpload, setShowImageUpload] = React.useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || (!content.trim() && !imageUrl)) return;

    setIsPosting(true);
    try {
      // Call the server action to create the course.
      await createCourse({
        title,
        content,
        image: imageUrl,
      });
      // Reset the form fields.
      setTitle("");
      setContent("");
      setImageUrl("");
      setShowImageUpload(false);

      toast.success("Course created successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create course.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <div className="w-full space-y-2">
              {/* Input for the course title. */}
              <Input
                placeholder="Course title..."
                className="border-none focus-visible:ring-0 p-0 text-base font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPosting}
              />
              {/* Textarea for the course content. */}
              <Textarea
                placeholder="Describe your course..."
                className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting}
              />
            </div>
          </div>

          {/* Conditionally render the image upload component. */}
          {(showImageUpload || imageUrl) && (
            <div className="border rounded-lg p-4">
              <ImageUpload
                endpoint="courseImage"
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  // Hide the upload component if the image is removed.
                  if (!url) setShowImageUpload(false);
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              {/* Button to toggle the image upload component. */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>
            </div>
            {/* Button to submit the form. */}
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={
                !title.trim() || (!content.trim() && !imageUrl) || isPosting
              }
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateCourse;
