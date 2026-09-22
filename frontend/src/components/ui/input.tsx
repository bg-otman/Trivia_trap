import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, type, invalid, ...props }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-12 w-full rounded-xl border bg-[#0e0e11] px-4 py-3 text-sm text-[#e4e1e6] shadow-sm outline-none transition placeholder:text-[#777782] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-2 border-[rgba(244,63,94,0.8)] text-[#fecdd3] focus-visible:ring-[#fb7185]" : "border-border focus:border-[#5b5fef]",
        className,
      )}
      {...props}
    />
  );
}
