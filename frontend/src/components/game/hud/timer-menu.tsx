"use client";

import { useState } from "react";
import { Check, ChevronDown, Timer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const options = [
  { label: "10s Ultra Blitz", meta: "CHAOS" },
  { label: "15s Blitz Mode" },
  { label: "30s Classic Casual" },
];

export function TimerMenu() {
  const [value, setValue] = useState("15s Blitz Mode");
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-[#e4e1e6]">ROUND TIMER LIMIT</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="surface"
            className="w-full justify-between border-2 border-primary bg-[#0e0e11]"
          >
            <span className="flex items-center gap-2">
              <Timer className="size-3.5 text-primary" />
              {value}
            </span>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.label}
              onSelect={() => setValue(option.label)}
              className={
                value === option.label
                  ? "bg-[rgba(255,107,53,0.2)] text-[#ffb59d]"
                  : ""
              }
            >
              <span>{option.label}</span>
              {option.meta ? (
                <span className="ml-auto text-[10px] font-bold text-[#efc141]">
                  {option.meta}
                </span>
              ) : null}
              {value === option.label ? (
                <Check className="ml-auto size-3.5" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
