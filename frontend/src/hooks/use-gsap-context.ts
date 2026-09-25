"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";

export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  setup: () => void,
  dependencies: readonly unknown[] = [],
) {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const context = gsap.context(setup, scope);
    return () => context.revert();
    // setup is intentionally supplied by the caller as timeline configuration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
