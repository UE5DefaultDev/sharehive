import { MessageSquareText } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div className="flex h-full items-center justify-center flex-col overflow-hidden">
      <MessageSquareText className="w-80 h-80 text-secondary-background mb-4" />
      <h1 className="text-3xl font-bold text-secondary-background mb-2">
        Select a chat...
      </h1>
    </div>
  );
};

export default page;
