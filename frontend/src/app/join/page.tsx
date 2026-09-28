import type { Metadata } from "next";
import { JoinRoom } from "@/components/join/join-room";

export const metadata: Metadata = {
  title: "Join a Room | Trivia Trap",
  description: "Enter a room code and join your Trivia Trap game.",
};

export default function JoinPage() {
  return <JoinRoom />;
}

