"use client";

import * as React from "react";
import Image from "next/image";
import {
  Film,
  FlaskConical,
  History,
  Trophy,
  Gamepad2,
  Music,
  Globe2,
  BookOpen,
  Palette,
  Cpu,
  Utensils,
  HeartPulse,
  Plane,
  PawPrint,
  Languages,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Category =
  | "movies"
  | "science"
  | "history"
  | "sports"
  | "gaming"
  | "music"
  | "geography"
  | "literature"
  | "art"
  | "technology"
  | "food"
  | "health"
  | "travel"
  | "animals"
  | "languages";

interface CategoryCardProps {
  category: Category;
  label?: string;
  imageUrl?: string | null;
  selected?: boolean;
  disabled?: boolean;
  variant?: "default" | "selected" | "interactive";
  onSelect?: (category: Category) => void;
  className?: string;
}

const categoryConfig: Record<
  Category,
  {
    label: string;
    icon: LucideIcon;
    color: string;
  }
> = {
  movies: {
    label: "MOVIES",
    icon: Film,
    color: "text-rose-400",
  },

  science: {
    label: "SCIENCE",
    icon: FlaskConical,
    color: "text-cyan-400",
  },

  history: {
    label: "HISTORY",
    icon: History,
    color: "text-amber-400",
  },

  sports: {
    label: "SPORTS",
    icon: Trophy,
    color: "text-yellow-400",
  },

  gaming: {
    label: "GAMING",
    icon: Gamepad2,
    color: "text-violet-400",
  },

  music: {
    label: "MUSIC",
    icon: Music,
    color: "text-pink-400",
  },

  geography: {
    label: "GEOGRAPHY",
    icon: Globe2,
    color: "text-emerald-400",
  },

  literature: {
    label: "LITERATURE",
    icon: BookOpen,
    color: "text-orange-400",
  },

  art: {
    label: "ART",
    icon: Palette,
    color: "text-fuchsia-400",
  },

  technology: {
    label: "TECHNOLOGY",
    icon: Cpu,
    color: "text-blue-400",
  },

  food: {
    label: "FOOD",
    icon: Utensils,
    color: "text-lime-400",
  },

  health: {
    label: "HEALTH",
    icon: HeartPulse,
    color: "text-red-400",
  },

  travel: {
    label: "TRAVEL",
    icon: Plane,
    color: "text-sky-400",
  },

  animals: {
    label: "ANIMALS",
    icon: PawPrint,
    color: "text-teal-400",
  },

  languages: {
    label: "LANGUAGES",
    icon: Languages,
    color: "text-indigo-400",
  },
};

export function CategoryCard({
  category,
  label,
  imageUrl,
  selected = false,
  disabled = false,
  variant = "default",
  onSelect,
  className,
}: CategoryCardProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <Card
      className={cn(
        "group relative",
        "min-h-[150px]",
        "p-6",

        (variant === "selected" || selected) &&
          "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,107,53,0.28)]",
        variant === "interactive" &&
          !disabled &&
          "cursor-pointer hover:border-primary/50 active:scale-[0.98]",
        variant === "default" && "border-border",
        disabled && "cursor-default opacity-70",
        className,
      )}
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) {
          onSelect?.(category);
        }
      }}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect?.(category);
        }
      }}
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
        {/* Icon */}
        <div
          className={cn(
            "mb-4 flex size-14 items-center justify-center",
            "rounded-xl",
            "transition-all duration-200",

            selected
              ? [
                  "bg-primary/15",
                  "text-primary",
                  "shadow-[0_0_20px_rgba(255,107,53,0.18)]",
                ]
              : [
                  "bg-white/[0.04]",
                  config.color,
                  "group-hover:bg-primary/10",
                  "group-hover:text-primary",
                ],
          )}
        >
          {imageUrl && !imageFailed ? (
            <Image
              src={imageUrl}
              alt=""
              width={56}
              height={56}
              unoptimized
              className="size-14 rounded-xl object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Icon className="size-7 drop-shadow-[0_0_8px_currentColor]" />
          )}
        </div>

        {/* Label */}
        <span
          className={cn(
            "text-sm font-extrabold tracking-wide",
            "transition-colors duration-200",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {label ?? config.label}
        </span>

        {/* Selected indicator */}
        {selected && (
          <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
            SELECTED
          </span>
        )}
      </div>
    </Card>
  );
}
