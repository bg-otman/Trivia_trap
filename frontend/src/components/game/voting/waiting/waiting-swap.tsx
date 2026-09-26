"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { waitingEase, waitingPacing } from "@/animations/waiting-pacing";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export function WaitingSwap({
  waiting,
  arena,
  children,
  className,
}: {
  waiting: boolean;
  arena: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [confirmed, setConfirmed] = useState(waiting);

  useEffect(() => {
    // Keep the disabled controls mounted long enough to show the lock confirmation.
    const timeout = window.setTimeout(
      () => setConfirmed(waiting),
      waiting ? (reducedMotion ? 80 : waitingPacing.lockHoldMs) : 0,
    );
    return () => window.clearTimeout(timeout);
  }, [waiting, reducedMotion]);

  return (
    <div className={cn("grid items-center", className)}>
      <AnimatePresence initial={false}>
        {waiting && confirmed ? (
          <motion.div
            key="waiting"
            className="col-start-1 row-start-1 min-w-0"
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{
              duration: reducedMotion ? 0.12 : waitingPacing.entrance,
              ease: waitingEase,
            }}
          >
            {arena}
          </motion.div>
        ) : (
          <motion.div
            key="action"
            className="col-start-1 row-start-1 min-w-0"
            inert={waiting}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: reducedMotion ? 1 : 0.96,
              y: reducedMotion ? 0 : 8,
            }}
            transition={{
              duration: reducedMotion ? 0.12 : waitingPacing.exit,
              ease: waitingEase,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
