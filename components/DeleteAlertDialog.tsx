/**
 * This file defines the DeleteAlertDialog component, which is a reusable confirmation dialog for delete actions.
 * It uses the 'use client' directive to indicate that this is a client-side component.
 */
"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
// Import UI components.
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteAlertDialogProps {
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
}

/**
 * The DeleteAlertDialog component.
 * It displays a confirmation dialog before performing a delete action.
 *
 * @param {DeleteAlertDialogProps} props - The properties for the component.
 * @returns {JSX.Element} The JSX for the delete alert dialog.
 */
export function DeleteAlertDialog({
  isDeleting,
  onDelete,
  title = "Delete Post",
  description = "This action cannot be undone.",
}: DeleteAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-red-500 -mr-2"
        >
          {/* Show a loader icon while deleting, otherwise show a trash icon. */}
          {isDeleting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <Trash2Icon className="size-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      {/* The content of the dialog. */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
