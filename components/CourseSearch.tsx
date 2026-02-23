"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";

export default function CourseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get("query") || "");
  const [query] = useDebounce(text, 500);

  useEffect(() => {
    if (!query) {
      router.push("/discover");
    } else {
      router.push(`/discover?query=${query}`);
    }
  }, [query, router]);

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={text}
        placeholder="Search courses..."
        className="pl-10"
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
