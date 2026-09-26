import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-display font-bold tracking-[0.05em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "arcade-push bg-primary text-primary-foreground [--arcade-shadow:#832600]",
        flame:
          "arcade-push bg-primary text-primary-foreground [--arcade-shadow:#832600]",
        secondary:
          "arcade-push bg-secondary text-white [--arcade-shadow:#17186b]",
        host: "arcade-push bg-accent text-accent-foreground [--arcade-shadow:#6e5600]",
        destructive:
          "arcade-push bg-destructive text-white [--arcade-shadow:#86172d]",
        trap: "arcade-push bg-destructive text-white [--arcade-shadow:#86172d]",
        outline:
          "border-2 border-border bg-transparent text-[#e4e1e6] hover:border-[#58585f] hover:bg-popover",
        ghost: "bg-transparent text-[#e4e1e6] shadow-none hover:bg-muted",
        surface:
          "border border-border bg-popover text-[#e4e1e6] hover:border-[#59585d] hover:bg-[#27272c]",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-5 text-sm",
        lg: "h-14 px-7 text-base",
        icon: "size-11 p-0",
        "icon-sm": "size-8 rounded-lg p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
