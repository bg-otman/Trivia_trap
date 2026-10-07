"use client";

import { useEffect, useState } from "react";
import { Check, Copy, LogOut, MoreVertical, Settings, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { GamePhase } from "@/types/game";

interface GameMenuProps {
  roomCode: string;
  phase: GamePhase;
  round: number;
  totalRounds: number;
  onLeaveRoom?: () => void;
}

export function GameMenu({ roomCode, phase, round, totalRounds, onLeaveRoom }: GameMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="surface"
                  size="icon-sm"
                  aria-label="Open game menu"
                  aria-expanded={menuOpen}
                  className={cn(menuOpen && "border-primary/40 bg-primary/15 text-primary")}
                >
                  <MoreVertical className="size-3.5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Game menu</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Game Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings className="mr-2 size-3.5" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copyRoomCode}>
            {copied ? <Check className="mr-2 size-3.5 text-[#34d399]" /> : <Copy className="mr-2 size-3.5" />}
            {copied ? "Copied!" : "Copy Room Code"}
          </DropdownMenuItem>
          {onLeaveRoom ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setLeaveOpen(true)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 size-3.5" aria-hidden="true" />
                Leave Room
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>GAME SETTINGS</DialogTitle>
            <DialogDescription>Current room and match information.</DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-3 rounded-2xl border border-white/10 bg-[#0e0e11] p-4 text-sm">
            <GameInfo label="Room code" value={roomCode} />
            <GameInfo label="Round" value={`${round} / ${totalRounds}`} />
            <GameInfo label="Phase" value={phase.replaceAll("_", " ")} />
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Room rules are locked during a match and can be changed by the host in the lobby.
          </p>
          <DialogFooter className="mt-5">
            <DialogClose asChild><Button variant="outline">CLOSE</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pr-10">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/15 text-destructive">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </span>
              <div>
                <DialogTitle>LEAVE ROOM?</DialogTitle>
                <DialogDescription>Are you sure you want to leave this game?</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild><Button variant="outline">CANCEL</Button></DialogClose>
            <Button type="button" variant="destructive" onClick={onLeaveRoom}>
              <LogOut className="size-3.5" aria-hidden="true" />
              LEAVE ROOM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GameInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <strong className="font-mono text-xs text-white">{value}</strong>
    </div>
  );
}
