"use client";

import { useEffect, useState } from "react";
import { BookOpen, Code, GraduationCap, Laptop, Music, Palette, Sparkles, Zap } from "lucide-react";

export default function FloatingIcons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const icons = [
    { icon: BookOpen, top: "15%", left: "10%", delay: "0s", duration: "12s", size: 80, color: "text-primary" },
    { icon: Code, top: "25%", left: "80%", delay: "1s", duration: "15s", size: 100, color: "text-accent" },
    { icon: GraduationCap, top: "65%", left: "15%", delay: "2s", duration: "18s", size: 120, color: "text-primary" },
    { icon: Laptop, top: "75%", left: "85%", delay: "3s", duration: "14s", size: 90, color: "text-accent" },
    { icon: Music, top: "45%", left: "45%", delay: "4s", duration: "20s", size: 110, color: "text-primary" },
    { icon: Palette, top: "10%", left: "55%", delay: "5s", duration: "16s", size: 70, color: "text-accent" },
    { icon: Sparkles, top: "85%", left: "40%", delay: "6s", duration: "13s", size: 60, color: "text-primary" },
    { icon: Zap, top: "40%", left: "10%", delay: "7s", duration: "11s", size: 85, color: "text-accent" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {icons.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`absolute opacity-15 dark:opacity-25 transition-all duration-1000 ease-in-out ${item.color}`}
            style={{
              top: item.top,
              left: item.left,
              animation: `float ${item.duration} ease-in-out infinite`,
              animationDelay: item.delay,
            }}
          >
            <Icon size={item.size} strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
}
