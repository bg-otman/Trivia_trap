"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, Send } from "lucide-react";
import { PlayerAvatar } from "../players/player-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { animateTypingDots } from "@/animations/micro-interactions";
import type { ChatMessageData } from "@/types/chat";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface GroupChatProps {
  messages: ChatMessageData[];
  onSendMessage: (message: string) => void;
  className?: string;
}

export function GroupChat({ messages, onSendMessage, className }: GroupChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <Card className={cn("flex min-h-[460px] flex-col overflow-hidden bg-[#1c1c22]/95 shadow-[0_20px_55px_rgba(0,0,0,0.28)]", className)}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-[#5b5fef]" />
          <div>
            <h2 className="font-display text-sm font-black text-white">ROOM CHAT</h2>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Everyone in this room</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-black text-[#4ade80]">
          <span className="size-1.5 rounded-full bg-[#4ade80]" /> LIVE
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5" aria-live="polite">
        {messages.length === 0 ? (
          <EmptyState icon={MessageCircle} title="NO MESSAGES YET" description="Say hello!" className="h-full min-h-64" />
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
      </div>

      <TypingIndicator name="SARAH" />
      <ChatInput onSend={onSendMessage} />
    </Card>
  );
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      layout
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, x: message.isYou ? 8 : -8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.75 }}
      className={cn("flex items-end gap-2", message.isYou && "flex-row-reverse")}>
      <PlayerAvatar name={message.playerName} src={message.playerAvatar} size={32} />
      <div className={cn("max-w-[78%]", message.isYou && "text-right")}>
        <div className={cn("mb-1 flex items-center gap-2", message.isYou && "flex-row-reverse")}>
          <span className={cn("text-[9px] font-black", message.isYou ? "text-primary" : "text-white")}>{message.isYou ? "YOU" : message.playerName}</span>
          <time className="text-[9px] text-muted-foreground">{message.timestamp}</time>
        </div>
        <p className={cn(
          "rounded-2xl px-3 py-2 text-left text-xs leading-5",
          message.isYou
            ? "rounded-br-md border border-primary/30 bg-primary/15 text-[#fff3ee]"
            : "rounded-bl-md border border-white/[0.08] bg-black/20 text-foreground",
        )}>
          {message.text}
        </p>
      </div>
    </motion.div>
  );
}

export function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [message, setMessage] = useState("");
  const reducedMotion = useReducedMotion();

  function send() {
    const value = message.trim();
    if (!value) return;
    onSend(value);
    setMessage("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 border-t border-white/10 bg-black/10 p-3 sm:p-4">
      <label className="sr-only" htmlFor="room-chat-message">Message the room</label>
      <input
        id="room-chat-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={240}
        placeholder="Message the room..."
        autoComplete="off"
        className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <motion.div whileTap={reducedMotion ? undefined : { scale: 0.92 }}><Button type="submit" size="icon" disabled={!message.trim()} aria-label="Send message">
        <Send className="size-4" />
      </Button></motion.div>
    </form>
  );
}

function TypingIndicator({ name }: { name: string }) {
  const dots = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const targets = dots.current?.querySelectorAll("i");
    if (!targets) return;
    const animation = animateTypingDots(targets, Boolean(reducedMotion));
    return () => { animation?.cancel(); };
  }, [reducedMotion]);

  return (
    <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-2 text-[10px] text-muted-foreground">
      <span>{name} is typing</span>
      <span ref={dots} className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((dot) => <i key={dot} className="size-1 rounded-full bg-muted-foreground" />)}
      </span>
    </div>
  );
}
