"use client";

import { LogOut, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MatchExitDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <LogOut className="size-4" />
          OPEN LEAVE MATCH MODAL
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="pr-12">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-[rgba(244,63,94,0.4)] bg-[rgba(244,63,94,0.2)] text-[#fb7185]">
              <TriangleAlert className="size-5" />
            </span>
            <div>
              <DialogTitle>LEAVE CURRENT MATCH?</DialogTitle>
              <DialogDescription>Active match: Round 2 of 5</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="my-5 rounded-2xl border border-white/10 bg-[#0e0e11] p-4 text-xs leading-5 text-muted-foreground">
          <p className="font-medium text-[#e4e1e6]">
            Warning: You will forfeit your accumulated{" "}
            <strong className="text-[#ffb59d]">1,420 PTS</strong> and sabotage
            streak.
          </p>
          <p className="mt-2">
            Your team slot will be converted to a spectator pod until the round
            completes.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline">CANCEL</Button>
          <Button variant="destructive">
            <LogOut className="size-3.5" />
            QUIT TO LOBBY
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
