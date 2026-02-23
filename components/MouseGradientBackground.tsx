"use client";

import { useEffect, useState } from "react";

export default function MouseGradientBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Subtle Blue Grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.08] dark:opacity-[0.12]" />
      
      {/* Refined Mouse Glow - Multi-layered for soft edges */}
      <div
        className="absolute inset-0 transition-opacity duration-300 opacity-60 dark:opacity-40"
        style={{
          background: `
            radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--primary-rgb), 0.12), transparent 85%),
            radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--accent-rgb), 0.1), transparent 70%),
            radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--primary-rgb), 0.15), transparent 50%)
          `,
        }}
      />
    </div>
  );
}
