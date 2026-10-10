"use client";

import { useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import {
  CategoryCard,
  type Category,
} from "@/components/game/question/category-card";
import { gameSpring, StaggerGroup, StaggerItem } from "@/components/game/system/phase-transition";
import { captureCategoryCard } from "@/animations/category-transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { GameLanguage } from "@/types/game";

const roundCategories: Category[] = [
  "movies",
  "science",
  "history",
  "sports",
  "gaming",
  "geography",
  "music",
];

const supportedCategories: Category[] = [
  ...roundCategories,
  "literature",
  "art",
  "technology",
  "food",
  "health",
  "travel",
  "animals",
  "languages",
];

export interface CategoryOption {
  id: number;
  name: string;
  imageUrl: string | null;
}

interface CategoryPhaseProps {
  currentRound: number;
  totalRounds: number;
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
  onSelectCategoryOption?: (category: CategoryOption) => void;
  canChoose?: boolean;
  chooserName?: string;
  categories?: CategoryOption[];
  duration?: number;
  language?: GameLanguage;
}

export function CategoryPhase({
  currentRound,
  totalRounds,
  selectedCategory,
  onSelectCategory,
  onSelectCategoryOption,
  canChoose = true,
  chooserName,
  categories,
  duration,
  language = "en",
}: CategoryPhaseProps) {
  const [selectedKey, setSelectedKey] = useState<string | number | null>(null);
  const isLocked = selectedCategory !== null || selectedKey !== null;
  const reducedMotion = useReducedMotion();
  const displayedCategories = categories?.length
    ? categories.map((option) => ({
        key: option.id,
        category: categoryFromName(option.name),
        label: option.name.toUpperCase(),
        imageUrl: option.imageUrl,
        option,
      }))
    : roundCategories.map((category) => ({
        key: category,
        category,
        label: undefined,
        imageUrl: null,
        option: null,
      }));
  const selectedLabel = displayedCategories.find(
    (category) => category.key === selectedKey,
  )?.label;
  const selectedCategoryLabel = selectedLabel ?? selectedCategory?.toUpperCase();

  return (
    <section className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="w-full max-w-[1020px]">
        <header className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-accent">
            <Crown className="size-3.5 fill-current" aria-hidden="true" />
            <span className="font-meta text-[11px] font-bold tracking-[0.12em]">
              {canChoose ? "YOUR PICK" : `${chooserName?.toUpperCase() ?? "ANOTHER PLAYER"}'S PICK`} · ROUND {currentRound} OF {totalRounds}
            </span>
          </div>

          <h1 className="font-display text-3xl font-black tracking-[-0.03em] text-foreground sm:text-4xl">
            {canChoose
              ? "Choose the next category"
              : `${chooserName ?? "Another player"} is choosing the category`}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#a6a6ae] sm:text-base">
            {canChoose
              ? `Pick the arena for this round. Your choice locks as soon as you select it.${duration ? ` You have ${duration} seconds.` : ""}`
              : "You can view the available categories while you wait for their choice."}
          </p>
        </header>

        <StaggerGroup
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4"
        >
          {displayedCategories.map(({ key, category, label, imageUrl, option }) => {
            const selected = selectedKey === key || selectedCategory === category;
            return (
              <StaggerItem key={key}>
                <motion.div
                  dir={language === "ar" ? "rtl" : "ltr"}
                  data-category-card={category}
                  animate={reducedMotion ? { opacity: selectedCategory && !selected ? 0.55 : 1 } : {
                    opacity: selectedCategory && !selected ? 0.45 : 1,
                    scale: selected ? 1.04 : selectedCategory ? 0.97 : 1,
                    y: selected ? -4 : 0,
                  }}
                  transition={gameSpring}
                  className="relative"
                >
                  {selected && !reducedMotion ? (
                    <motion.span
                      className="pointer-events-none absolute inset-2 rounded-2xl border border-primary/40"
                      initial={{ opacity: 0.7, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.38 }}
                    />
                  ) : null}
                  <CategoryCard
                    category={category}
                    label={label}
                    imageUrl={imageUrl}
                    selected={selected}
                    disabled={isLocked || !canChoose}
                    variant="interactive"
                    onSelect={() => {
                      if (!canChoose) return;
                      setSelectedKey(key);
                      captureCategoryCard(document.querySelector(`[data-category-card="${category}"]`), Boolean(reducedMotion));
                      if (option && onSelectCategoryOption) {
                        onSelectCategoryOption(option);
                      } else {
                        onSelectCategory(category);
                      }
                    }}
                    className="min-h-[132px] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.24)] sm:min-h-[150px]"
                  />
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-lg backdrop-blur-md sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-ring">
              {isLocked ? (
                <Check className="size-5" strokeWidth={3} aria-hidden="true" />
              ) : (
                <Sparkles className="size-5" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-foreground">
                {isLocked
                  ? "PREPARING QUESTION..."
                  : canChoose
                    ? "Select one category"
                    : "WAITING FOR PLAYER"}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {selectedCategoryLabel ?? (canChoose
                  ? "Click a category to select and lock it."
                  : `${chooserName?.toUpperCase() ?? "ANOTHER PLAYER"} IS CHOOSING THE CATEGORY...`)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function categoryFromName(name: string): Category {
  const normalized = name.trim().toLowerCase();
  return supportedCategories.includes(normalized as Category)
    ? (normalized as Category)
    : "science";
}
