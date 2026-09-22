import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-ui text-xs font-bold leading-4 shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-muted-foreground",
        ready: "border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.15)] text-[#34d399]",
        host: "border-[rgba(247,201,72,0.4)] bg-[rgba(247,201,72,0.15)] text-accent",
        you: "border-[rgba(255,107,53,0.5)] bg-[rgba(255,107,53,0.2)] text-[#ffb59d]",
        voting: "border-[rgba(91,95,239,0.5)] bg-[rgba(91,95,239,0.2)] text-ring",
        eliminated: "border-[rgba(244,63,94,0.5)] bg-[rgba(244,63,94,0.2)] text-[#fb7185]",
        sabotage: "border-[#efc141] bg-[rgba(209,166,38,0.3)] text-[#ffdf92]",
        online: "border-border bg-[#0e0e11] font-normal text-[#e4e1e6]",
        primary: "border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.2)] text-[#ffb59d]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
