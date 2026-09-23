"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoomCodeProps {
  code: string;
  compact?: boolean;
  className?: string;
}

export function RoomCode({ code, compact, className }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={copy}
        type="button"
        className={cn(
          "flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-xs text-white hover:border-[#59585d]",
          className,
        )}
      >
        <span className="text-muted-foreground">PIN:</span>
        <strong>{code}</strong>
        {copied ? (
          <Check className="size-3 text-[#34d399]" />
        ) : (
          <Copy className="size-3 text-muted-foreground" />
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed border-[rgba(239,193,65,0.4)] bg-[#0e0e11] p-3.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] font-bold tracking-[0.1em] text-muted-foreground">
            ROOM CODE
          </p>
          <p className="font-mono text-2xl font-bold tracking-[0.25em] text-[#efc141]">
            {code}
          </p>
        </div>
        <Button variant="surface" size="sm" onClick={copy}>
          {copied ? (
            <Check className="size-3.5 text-[#34d399]" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "COPIED" : "COPY"}
        </Button>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
        <span className="text-muted-foreground">Share link auto-generated</span>
        <span className="font-bold text-[#34d399]">LOBBY OPEN</span>
      </div>
    </div>
  );
}
