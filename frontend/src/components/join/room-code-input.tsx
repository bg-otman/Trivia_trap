"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface RoomCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

const CODE_LENGTH = 6;

export function RoomCodeInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
}: RoomCodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label
        htmlFor="room-code"
        className="mb-3 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a6a6ae]"
      >
        Room code
      </label>
      <div
        className="relative grid grid-cols-6 gap-2 sm:gap-3"
        onClick={() => inputRef.current?.focus()}
      >
        {Array.from({ length: CODE_LENGTH }, (_, index) => {
          const character = value[index];
          const active = index === value.length && value.length < CODE_LENGTH;

          return (
            <div
              key={index}
              aria-hidden="true"
              className={cn(
                "grid aspect-[0.82] min-w-0 place-items-center rounded-xl border bg-[#111114] text-[clamp(1.25rem,6vw,2rem)] font-extrabold uppercase text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-all",
                invalid
                  ? "border-[#ff4d6d]/70 bg-[#ff4d6d]/[0.045] text-[#fecdd3]"
                  : active
                    ? "border-[#5b5fef] shadow-[0_0_0_3px_rgba(91,95,239,0.14)]"
                    : character
                      ? "border-[#4a4a52]"
                      : "border-[#353438]",
              )}
            >
              {character ?? <span className="mb-1 size-1.5 rounded-full bg-[#48484f]" />}
            </div>
          );
        })}
        <input
          ref={inputRef}
          id="room-code"
          name="room-code"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, CODE_LENGTH),
            )
          }
          disabled={disabled}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          maxLength={CODE_LENGTH}
          aria-describedby="room-code-help room-code-status"
          aria-invalid={invalid || undefined}
          className="absolute inset-0 z-10 size-full cursor-text opacity-0 disabled:cursor-not-allowed"
        />
      </div>
      <div id="room-code-help" className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.11em] text-[#777782]">
        <span>Letters &amp; numbers only</span>
        <span>{value.length} / {CODE_LENGTH}</span>
      </div>
    </div>
  );
}

