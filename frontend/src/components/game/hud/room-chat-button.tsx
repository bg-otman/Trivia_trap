"use client";

import { MessageCircle } from "lucide-react";
import { GroupChat } from "@/components/game/chat/group-chat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatMessageData } from "@/types/chat";

interface RoomChatButtonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessageData[];
  onSendMessage: (message: string) => void;
}

export function RoomChatButton({ open, onOpenChange, messages, onSendMessage }: RoomChatButtonProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="surface"
                size="icon-sm"
                aria-label={open ? "Close room chat" : "Open room chat"}
                aria-expanded={open}
                className={cn(open && "border-primary/40 bg-primary/15 text-primary")}
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{open ? "Close room chat" : "Room chat"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent
        aria-describedby={undefined}
        className="left-auto right-0 top-0 h-dvh w-[min(92vw,400px)] max-w-none translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 p-3 sm:p-4"
      >
        <DialogTitle className="sr-only">Room chat</DialogTitle>
        <GroupChat
          messages={messages}
          onSendMessage={onSendMessage}
          className="h-full min-h-0 border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}
