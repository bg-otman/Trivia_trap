import * as React from "react";
import { cn } from "@/lib/utils";

interface SystemSectionProps extends React.HTMLAttributes<HTMLElement> {
  index: string;
  title: string;
  description: string;
  meta?: string;
  accent?: "orange" | "indigo" | "yellow" | "neutral" | "rose";
}

const accentClasses = {
  orange: "bg-primary/20 text-[#ffb59d]",
  indigo: "bg-secondary text-white",
  yellow: "bg-[#efc141] text-[#3e2e00]",
  neutral: "bg-[#39393c] text-white",
  rose: "bg-[#ffb59d] text-[#5d1900]",
};

export function SystemSection({
  index,
  title,
  description,
  meta,
  accent = "orange",
  className,
  children,
  ...props
}: SystemSectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)} {...props}>
      <header className="flex flex-col gap-3 border-b border-border pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold",
              accentClasses[accent],
            )}
          >
            {index}
          </span>
          <div>
            <h2 className="font-display text-xl font-bold tracking-[-0.01em] text-white sm:text-2xl">
              {title}
            </h2>
            <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {meta ? (
          <p className="font-mono text-xs text-muted-foreground">{meta}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function SpecPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
