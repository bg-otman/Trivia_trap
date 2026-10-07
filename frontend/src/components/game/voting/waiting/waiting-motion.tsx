"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { useIsPresent } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// The outgoing phase can remain mounted during its cinematic exit.
export const WaitingMotionContext = createContext(true);

function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const getSnapshot = () => document.visibilityState === "visible";
const getServerSnapshot = () => false;

export function useWaitingMotion() {
  const phaseActive = useContext(WaitingMotionContext);
  const isPresent = useIsPresent();
  const visible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const reducedMotion = useReducedMotion();

  return {
    reducedMotion,
    enabled: phaseActive && isPresent && visible && !reducedMotion,
  };
}
