"use client";

import { useEffect, useState } from "react";
import { getProject, onChange } from "@theatre/core";

export function useTheatreCinematic(name: string, duration: number, enabled = true) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let stopListening: (() => void) | undefined;
    const project = getProject("Trivia Trap Cinematics");

    void project.ready.then(() => {
      if (disposed) return;
      const sheet = project.sheet(name);
      sheet.sequence.pause();
      sheet.sequence.position = 0;
      stopListening = onChange(sheet.sequence.pointer.position, (nextPosition) => {
        if (!disposed) setPosition(Math.min(1, nextPosition / duration));
      });
      void sheet.sequence.play({ range: [0, duration], rate: 1 });
    });

    return () => {
      disposed = true;
      stopListening?.();
      project.sheet(name).sequence.pause();
    };
  }, [duration, enabled, name]);

  return enabled ? position : 1;
}
