"use client";

import { useRef, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { createPhaseEntrance } from "@/animations/phase-transitions";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cinematicSpring } from "@/animations/pacing";

const spring = cinematicSpring;

const reducedVariants: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function PhaseTransition({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  const scope = useRef<HTMLDivElement>(null);
  useGsapContext(scope, () => {
    if (scope.current) createPhaseEntrance(scope.current, Boolean(reducedMotion));
  }, [reducedMotion]);

  return (
    <motion.div
      className={cn("flex w-full flex-1 flex-col justify-center", className)}
      variants={reducedMotion ? reducedVariants : { initial: { opacity: 0 }, enter: { opacity: 1 }, exit: { opacity: 0 } }}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <div ref={scope} data-phase-surface className="flex w-full flex-1 flex-col justify-center">
        {children}
      </div>
    </motion.div>
  );
}

export function PhaseContent({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0.12 } : { ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className, delay = 0.12, stagger = 0.09 }: { children: ReactNode; className?: string; delay?: number; stagger?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { delayChildren: reducedMotion ? 0 : delay, staggerChildren: reducedMotion ? 0 : stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, direction = 1, layoutId }: { children: ReactNode; className?: string; direction?: 1 | -1; layoutId?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      layout
      layoutId={layoutId}
      variants={{
        hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, x: 22 * direction, y: 12, scale: 0.97 },
        show: reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, scale: 1, transition: spring },
      }}
    >
      {children}
    </motion.div>
  );
}

export { spring as gameSpring };
