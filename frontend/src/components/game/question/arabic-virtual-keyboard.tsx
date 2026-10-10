"use client";

import { useEffect, useRef, useState } from "react";

interface KeyboardElement extends HTMLElement {
  getTextAreaValue(): string;
  updateState(state: { textValue: string }): void;
  updateComplete: Promise<boolean>;
}

interface ArabicVirtualKeyboardProps {
  value: string;
  maxLength: number;
  disabled: boolean;
  onChange: (value: string) => void;
  onUnavailable: () => void;
}

export function ArabicVirtualKeyboard({
  value,
  maxLength,
  disabled,
  onChange,
  onUnavailable,
}: ArabicVirtualKeyboardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<KeyboardElement | null>(null);
  const valueRef = useRef(value);
  const disabledRef = useRef(disabled);
  const onChangeRef = useRef(onChange);
  const onUnavailableRef = useRef(onUnavailable);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    valueRef.current = value;
    const keyboard = keyboardRef.current;
    if (keyboard && keyboard.getTextAreaValue() !== value) {
      keyboard.updateState({ textValue: value });
    }
  }, [value]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    onChangeRef.current = onChange;
    onUnavailableRef.current = onUnavailable;
  }, [onChange, onUnavailable]);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    const host = hostRef.current;

    void import("arabic-virtual-keyboard").then(async () => {
      if (cancelled || !host) return;

      const keyboard = document.createElement("arabic-keyboard") as KeyboardElement;
      keyboard.setAttribute("showEnglishValue", "true");
      keyboard.style.display = "block";
      keyboard.style.width = "100%";
      keyboard.style.setProperty("--max-keyboard-width", "100%");
      keyboard.style.setProperty("--row-height", "44px");
      keyboard.style.setProperty("--font-size", "16px");
      keyboard.style.setProperty("--button-background-color", "#2a2a2d");
      keyboard.style.setProperty("--button-color", "#f8f8f2");
      keyboard.style.setProperty("--button-eng-color", "#a6a6ae");
      keyboard.style.setProperty("--button-shifted-color", "#f7c948");
      keyboard.style.setProperty("--button-hover-background-color", "#353438");
      keyboard.style.setProperty("--button-active-background-color", "#ff6b35");
      keyboard.style.setProperty("--button-active-border", "1px solid #ff6b35");
      keyboard.style.setProperty("--border", "1px solid #4a4953");
      keyboard.style.setProperty("--textarea-background-color", "#0e0e11");
      keyboard.style.setProperty("--textarea-input-color", "#f8f8f2");
      keyboard.style.setProperty("--border-radius", "8px");
      keyboardRef.current = keyboard;
      host.appendChild(keyboard);

      const syncAnswer = (event: Event) => {
        const raw = keyboard.getTextAreaValue();
        const next = raw.replace(/[\r\n]+/g, " ").slice(0, maxLength);
        if (next !== raw) keyboard.updateState({ textValue: next });
        if (next !== valueRef.current) {
          valueRef.current = next;
          onChangeRef.current(next);
        }

        if (event.type === "click") {
          const clickedKey = event.composedPath().find((target) =>
            target instanceof HTMLButtonElement && keyboard.shadowRoot?.contains(target),
          ) as HTMLButtonElement | undefined;
          if (clickedKey && !["audio", "information"].includes(clickedKey.value)) {
            keyboard.shadowRoot?.querySelector("textarea")?.focus({ preventScroll: true });
          }
        }
      };

      for (const event of ["click", "keydown", "paste", "cut", "input"]) {
        keyboard.addEventListener(event, syncAnswer);
      }
      cleanup = () => {
        for (const event of ["click", "keydown", "paste", "cut", "input"]) {
          keyboard.removeEventListener(event, syncAnswer);
        }
        keyboard.remove();
        keyboardRef.current = null;
      };

      keyboard.updateState({ textValue: valueRef.current });
      await keyboard.updateComplete;
      if (cancelled) return;

      const textarea = keyboard.shadowRoot?.querySelector("textarea");
      if (textarea) {
        textarea.rows = 2;
        textarea.maxLength = maxLength;
        textarea.setAttribute("aria-label", "اكتب جوابك بالعربية");
        textarea.style.minHeight = "72px";
        if (!disabledRef.current) textarea.focus({ preventScroll: true });
      }
      setReady(true);
    }).catch(() => {
      if (!cancelled) onUnavailableRef.current();
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [maxLength]);

  useEffect(() => {
    const keyboard = keyboardRef.current;
    if (!keyboard) return;
    keyboard.style.pointerEvents = disabled ? "none" : "";
    const textarea = keyboard.shadowRoot?.querySelector("textarea");
    if (textarea) textarea.disabled = disabled;
  }, [disabled, ready]);

  return (
    <div id="arabic-keyboard-panel" role="group" aria-label="لوحة المفاتيح العربية" lang="ar" className="min-w-0 flex-1">
      {!ready && <p role="status" className="py-4 text-sm text-muted-foreground">جاري تحميل لوحة المفاتيح العربية…</p>}
      <div ref={hostRef} className="w-full overflow-x-auto" />
    </div>
  );
}
