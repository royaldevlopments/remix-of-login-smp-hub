import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ServerIp({ ip, className }: { ip: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(ip);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={cn(
        "pixel-border inline-flex items-center gap-3 bg-secondary px-4 py-3 text-pixel text-xs text-accent transition-transform hover:-translate-y-0.5 md:text-sm",
        className,
      )}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "COPIED!" : ip}
    </button>
  );
}
