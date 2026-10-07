"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useWaitingMotion } from "./waiting-motion";

export function WaitingMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  const { enabled } = useWaitingMotion();
  const label = message.replace(/(?:\.{3}|…)\s*$/, "");

  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "font-meta text-[11px] font-black leading-6 tracking-[0.12em] text-foreground",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {label}
        <span className="inline-flex w-[3ch] whitespace-nowrap text-primary">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={`${index}-${enabled}`}
              initial={false}
              animate={{ opacity: enabled ? [0.2, 1, 0.2] : 1 }}
              transition={
                enabled
                  ? {
                      duration: 1.8,
                      delay: index * 0.24,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : { duration: 0.12 }
              }
            >
              .
            </motion.span>
          ))}
        </span>
      </span>
    </p>
  );
}
