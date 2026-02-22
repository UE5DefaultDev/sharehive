/**
 * This file defines the ImageUpload component, which provides an interface for uploading images.
 * It uses the UploadDropzone component from 'uploadthing' to handle the file upload process.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
// OurFileRouter defines the available upload endpoints (postImage, courseImage) with their size limits.
import { OurFileRouter } from "@/app/api/uploadthing/core";

// Define the props for the ImageUpload component.
interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: keyof OurFileRouter;
}

/**
 * The ImageUpload component.
 * It displays an upload dropzone or a preview of the uploaded image with a remove button.
 *
 * @param {ImageUploadProps} props - The properties for the component.
 * @returns {JSX.Element} The JSX for the image upload component.
 */
function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  // If an image URL is provided (i.e., an image has been uploaded), display the image preview.
  if (value) {
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Upload"
          className="rounded-md size-40 object-cover"
        />
        {/* The button to remove the uploaded image. */}
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }
  // If no image URL is provided, display the upload dropzone.
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        // When the upload is complete, call the onChange callback with the new image URL.
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
}
export default ImageUpload;
