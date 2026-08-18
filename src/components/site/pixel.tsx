import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PixelPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pixel-border bg-card p-6", className)}>{children}</div>
  );
}

export function PixelHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "text-pixel text-primary drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)]",
        Tag === "h1" ? "text-2xl md:text-4xl" : "text-lg md:text-2xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
