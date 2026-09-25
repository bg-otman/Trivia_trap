"use client";

import { Check, Crown, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import {
  CategoryCard,
  type Category,
} from "@/components/game/question/category-card";
import { gameSpring, StaggerGroup, StaggerItem } from "@/components/game/system/phase-transition";
import { captureCategoryCard } from "@/animations/category-transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const roundCategories: Category[] = [
  "movies",
  "science",
  "history",
  "sports",
  "gaming",
  "geography",
  "music",
];

interface CategoryPhaseProps {
  currentRound: number;
  totalRounds: number;
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
}

export function CategoryPhase({
  currentRound,
  totalRounds,
  selectedCategory,
  onSelectCategory,
}: CategoryPhaseProps) {
  const isLocked = selectedCategory !== null;
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="w-full max-w-[1020px]">
        <header className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-accent">
            <Crown className="size-3.5 fill-current" aria-hidden="true" />
            <span className="font-meta text-[11px] font-bold tracking-[0.12em]">
              HOST&apos;S PICK · ROUND {currentRound} OF {totalRounds}
            </span>
          </div>

          <h1 className="font-display text-3xl font-black tracking-[-0.03em] text-foreground sm:text-4xl">
            Choose the next category
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#a6a6ae] sm:text-base">
            Pick the arena for this round. Your choice locks as soon as you
            select it.
          </p>
        </header>

        <StaggerGroup
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4"
        >
          {roundCategories.map((category) => {
            const selected = selectedCategory === category;
            return (
              <StaggerItem key={category}>
                <motion.div
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
                    selected={selected}
                    disabled={isLocked}
                    variant="interactive"
                    onSelect={() => {
                      captureCategoryCard(document.querySelector(`[data-category-card="${category}"]`), Boolean(reducedMotion));
                      onSelectCategory(category);
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
                {isLocked ? "Category locked in" : "Select one category"}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {selectedCategory
                  ? selectedCategory.toUpperCase()
                  : "Click a category to select and lock it."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
