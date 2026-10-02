"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Pencil,
  MoreVertical,
  Play,
  Settings2,
  Share2,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
  Zap,
  Wifi,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GroupChat } from "../chat/group-chat";
import { PlayerAvatar } from "../players/player-avatar";
import { StatusBadge } from "../players/status-badge";
import { RoomCode } from "../hud/room-code";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ChatMessageData } from "@/types/chat";
import type { GameSettings } from "@/types/game";
import type { Player } from "@/types/player";
import type { ServerErrorData } from "@/lib/websocket/websocket-types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { WaitingArena } from "@/components/game/voting/waiting/waiting-arena";
import { WaitingMessage } from "@/components/game/voting/waiting/waiting-message";

export type LobbyConnectionState = "connected" | "joining" | "connecting" | "reconnecting" | "restored" | "failed";

interface LobbyPhaseProps {
  players: Player[];
  roomCode: string;
  settings: GameSettings;
  chatMessages: ChatMessageData[];
  isHost: boolean;
  onStartGame: () => void;
  onKickPlayer: (playerId: Player["id"]) => void;
  onSettingsChange: (settings: GameSettings) => void;
  onSendMessage: (message: string) => void;
  showMockChatTyping?: boolean;
  connectionState?: LobbyConnectionState;
  connectionError?: ServerErrorData | null;
  onRetryConnection?: () => void;
  onLeaveRoom?: () => void;
}

const settingFields: Array<{
  key: keyof GameSettings;
  label: string;
  suffix: string;
  min: number;
  max: number;
}> = [
    { key: "totalRounds", label: "TOTAL ROUNDS", suffix: "ROUNDS", min: 1, max: 10 },
    { key: "bluffTime", label: "BLUFF TIME", suffix: "SECONDS", min: 10, max: 120 },
    { key: "voteTime", label: "VOTE TIME", suffix: "SECONDS", min: 10, max: 120 },
    { key: "maxPlayers", label: "MAX PLAYERS", suffix: "PLAYERS", min: 2, max: 20 },
  ];

export function LobbyPhase({
  players,
  roomCode,
  settings,
  chatMessages,
  isHost,
  onStartGame,
  onKickPlayer,
  onSettingsChange,
  onSendMessage,
  showMockChatTyping = false,
  connectionState = "connected",
  connectionError,
  onRetryConnection,
  onLeaveRoom,
}: LobbyPhaseProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftSettings, setDraftSettings] = useState(settings);
  const [shared, setShared] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  const eligiblePlayers = players.filter((player) => player.role !== "HOST");
  const readyPlayers = eligiblePlayers.filter((player) => player.status !== "OFFLINE");
  const openSlots = Math.max(0, settings.maxPlayers - players.length);
  const joinUrl = `http://localhost:3000/room/${roomCode}`;

  async function shareRoom() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my Trivia Trap room",
          text: `Join Trivia Trap with room code ${roomCode}`,
          url: joinUrl,
        });
      } else {
        await navigator.clipboard.writeText(joinUrl);
      }
      setShareFailed(false);
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    } catch {
      setShared(false);
      setShareFailed(true);
    }
  }

  function saveSettings() {
    onSettingsChange(draftSettings);
    setSettingsOpen(false);
  }

  return (
    <section className="relative z-10 w-full px-4 py-5 sm:px-6 sm:py-8 lg:px-8 mb-18">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 text-primary">
              <Zap className="size-6 fill-current" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] text-primary">TRIVIA TRAP</p>
              <h1 className="font-display text-2xl font-black tracking-wide text-white sm:text-3xl">GAME ROOM</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <span className="size-2 rounded-full bg-[#4ade80]" />
            <WaitingMessage message="LOBBY OPEN · WAITING FOR PLAYERS" className="text-[10px] text-muted-foreground" />
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <motion.div className="order-2 lg:col-start-1 lg:row-start-2" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 25 }}><Card className="overflow-hidden bg-[#1c1c22]/95 shadow-[0_20px_55px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
              <div>
                <h2 className="font-display text-lg font-black text-white">PLAYER ROSTER</h2>
                <p className="mt-1 text-xs text-muted-foreground">{players.length} / {settings.maxPlayers} PLAYERS JOINED</p>
              </div>
              <div className="rounded-full border border-[#4ade80]/25 bg-[#4ade80]/10 px-3 py-1.5 text-[10px] font-black text-[#4ade80]">
                {readyPlayers.length} / {eligiblePlayers.length} PLAYERS READY
              </div>
            </div>

            <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4">
              <AnimatePresence initial>
                {players.map((player) => (
                  <LobbyPlayer
                    key={player.id}
                    player={player}
                    canKick={isHost && player.role !== "HOST" && !player.isYou}
                    onKick={() => onKickPlayer(player.id)}
                  />
                ))}
              </AnimatePresence>
              {players.length <= 1 ? (
                <EmptyState icon={UserPlus} title="NO OTHER PLAYERS YET" description="Invite your friends to join." className="sm:col-span-2" />
              ) : null}
              {players.length > 1 ? Array.from({ length: openSlots }, (_, index) => (
                <div
                  key={`open-slot-${index}`}
                  className="flex min-h-[76px] items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 text-muted-foreground"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-white/15 bg-white/[0.025]">
                    <UserPlus className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-black tracking-[0.08em]">OPEN SLOT</p>
                    <p className="mt-0.5 text-[10px]">Waiting for a player</p>
                  </div>
                </div>
              )) : null}
            </div>
          </Card></motion.div>

          <div className="contents">
            <motion.div className="order-1 lg:col-start-1 lg:row-start-1" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 260, damping: 25 }}><Card className="bg-[#1c1c22]/95 p-4 shadow-[0_20px_55px_rgba(0,0,0,0.25)] sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <UsersRound className="size-4 text-[#5b5fef]" />
                <h2 className="font-display text-sm font-black text-white">ROOM INFORMATION</h2>
              </div>
              <RoomCode code={roomCode} />
              <div className="mt-4 grid grid-cols-[96px_1fr] items-center gap-4">
                <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-2">
                  <QRCodeSVG value={joinUrl} size={80} level="M" bgColor="#ffffff" fgColor="#111114" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">SCAN TO JOIN</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Open the room instantly on another device.</p>
                  <Button type="button" variant="secondary" size="sm" onClick={shareRoom} className="mt-3 w-full">
                    <Share2 className="size-3.5" />
                    {shared ? "LINK COPIED" : "SHARE ROOM"}
                  </Button>
                  {shareFailed ? (
                    <ErrorState title="UNABLE TO COPY LINK" description="Copy the room code manually and try again." actionLabel="TRY AGAIN" onAction={shareRoom} className="mt-3 p-3" />
                  ) : null}
                </div>
              </div>
            </Card></motion.div>
          </div>
          <motion.div className="order-4 lg:col-start-1 lg:row-start-3" initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 25 }}><Card className="bg-[#1c1c22]/95 p-4 shadow-[0_20px_55px_rgba(0,0,0,0.25)] sm:p-5 lg:col-start-1 lg:row-start-3">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-primary" />
                <h2 className="font-display text-sm font-black text-white">ROOM SETTINGS</h2>
              </div>
              {isHost ? (
                <Dialog
                  open={settingsOpen}
                  onOpenChange={(open) => {
                    if (open) setDraftSettings(settings);
                    setSettingsOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="surface">
                      <Pencil className="size-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg p-6 sm:p-8">
                    <DialogHeader>
                      <DialogTitle>ROOM SETTINGS</DialogTitle>
                      <DialogDescription>Adjust the rules before starting the game.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {settingFields.map((field) => (
                        <label key={field.key} className="grid gap-2 text-xs font-bold text-muted-foreground">
                          {field.label}
                          <input
                            type="number"
                            min={field.min}
                            max={field.max}
                            value={draftSettings[field.key]}
                            onChange={(event) => setDraftSettings((current) => ({
                              ...current,
                              [field.key]: Math.min(field.max, Math.max(field.min, Number(event.target.value))),
                            }))}
                            className="h-11 rounded-xl border border-border bg-background px-3 text-base font-bold text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                      ))}
                    </div>
                    <DialogFooter className="mt-7">
                      <Button type="button" variant="surface" onClick={() => setSettingsOpen(false)}>CANCEL</Button>
                      <Button type="button" onClick={saveSettings}>SAVE SETTINGS</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {settingFields.map((field) => (
                <div key={field.key} className="rounded-xl border border-white/[0.08] bg-black/15 p-3">
                  <p className="text-[9px] font-black tracking-[0.1em] text-muted-foreground">{field.label}</p>
                  <p className="mt-1.5 font-display text-lg font-black text-white">
                    {settings[field.key]} <span className="text-[9px] text-muted-foreground">{field.suffix}</span>
                  </p>
                </div>
              ))}
            </div>
          </Card></motion.div>
          <motion.div className="order-3 lg:sticky lg:top-5 lg:col-start-2 lg:row-span-3 lg:row-start-1" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 260, damping: 25 }}>
            <GroupChat messages={chatMessages} onSendMessage={onSendMessage} showTypingIndicator={showMockChatTyping} className="lg:h-[calc(100dvh-2.5rem)] lg:max-h-[820px] lg:min-h-[560px]" />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 25, delay: reducedMotion ? 0 : 0.08 }}><Card className="mt-5 bg-[#1c1c22]/95 p-3 shadow-[0_16px_45px_rgba(0,0,0,0.3)] sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 px-1">
              <ShieldCheck className="size-5 text-[#4ade80]" />
              <div>
                <p className="text-xs font-black text-white">{isHost ? "YOU ARE THE HOST" : "YOU'RE READY"}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {isHost ? "Start when everyone has joined." : "Waiting for the host to start the game."}
                </p>
              </div>
            </div>
            {isHost ? (
              <Button type="button" size="lg" onClick={onStartGame} className="w-full sm:w-auto sm:min-w-64">
                <Play className="size-4 fill-current" /> START GAME
              </Button>
            ) : null}
          </div>
          <WaitingArena players={players} compact animateAll message={isHost ? "ALL PLAYERS ARE READY" : "WAITING FOR THE HOST"} className="mt-4" />
        </Card></motion.div>
      </div>

      {connectionState !== "connected" ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-background/75 p-5 backdrop-blur-[2px]">
          {connectionState === "failed" ? (
            <ErrorState title={connectionError?.code === "FULL_ROOM" ? "ROOM FULL" : connectionError?.code === "ROOM_NOT_FOUND" ? "ROOM NOT FOUND" : connectionError?.code === "FORBIDDEN" ? "ACCESS DENIED" : connectionError?.code === "PLAYER_NOT_FOUND" ? "PLAYER NOT FOUND" : "CONNECTION LOST"} description={connectionError?.message ?? "We couldn&apos;t reconnect to the room."} actionLabel="RETRY" onAction={onRetryConnection} secondaryActionLabel="LEAVE ROOM" onSecondaryAction={onLeaveRoom} className="w-full max-w-lg bg-card" />
          ) : connectionState === "restored" ? (
            <div role="status" className="flex items-center gap-2 rounded-2xl border border-[#4ade80]/30 bg-card px-5 py-4 font-display text-sm font-black text-[#4ade80] shadow-xl"><Wifi className="size-4" /> CONNECTED ✓</div>
          ) : (
            <LoadingState title={connectionState === "joining" ? "JOINING ROOM..." : connectionState === "connecting" ? "CONNECTING TO ROOM" : "RECONNECTING..."} description={connectionState === "joining" ? "Preparing your lobby" : connectionState === "connecting" ? "Joining the game..." : "Trying to restore your connection."} variant="game" className="w-full max-w-lg" />
          )}
        </div>
      ) : null}
    </section>
  );
}

function LobbyPlayer({ player, canKick, onKick }: { player: Player; canKick: boolean; onKick: () => void }) {
  const reducedMotion = useReducedMotion();
  const offline = player.status === "OFFLINE";
  const ready = !offline;

  return (
    <motion.div
      layout
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.8 }}
      className={cn(
        "flex min-h-[76px] items-center gap-3 rounded-2xl border bg-black/15 px-3 py-3",
        player.isYou ? "border-primary/70 shadow-[inset_3px_0_0_#ff6b35]" : "border-white/[0.08]",
        offline && "opacity-55",
      )}>
      <PlayerAvatar name={player.name} src={player.avatar} size={40} status={player.role === "HOST" ? "host" : ready ? "ready" : "default"} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-black text-white">{player.name}</p>
          {player.role === "HOST" ? <StatusBadge status="host" className="px-2 py-0.5 text-[8px]">HOST</StatusBadge> : null}
          {player.isYou ? <StatusBadge status="you" className="px-2 py-0.5 text-[8px]">YOU</StatusBadge> : null}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {player.role !== "HOST" ? (
            <StatusBadge status="ready" className="px-2 py-0.5 text-[8px]">READY</StatusBadge>
          ) : (
            <span className="text-[9px] font-bold text-accent">HOST IS READY</span>
          )}
          <span className={cn("flex items-center gap-1 text-[9px] font-bold", offline ? "text-muted-foreground" : "text-[#4ade80]")}>
            <span className={cn("size-1.5 rounded-full", offline ? "bg-muted-foreground" : "bg-[#4ade80]")} />
            {offline ? "OFFLINE" : "ONLINE"}
          </span>
        </div>
      </div>
      {canKick ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Manage ${player.name}`}>
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onKick} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-3.5" /> KICK PLAYER
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </motion.div>
  );
}
