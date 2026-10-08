import type { Metadata } from "next";
import { JoinRoom } from "@/components/join/join-room";

export const metadata: Metadata = {
  title: "Join a Room | Trivia Trap",
  description: "Enter a room code and join your Trivia Trap game.",
};

export default async function JoinPage({ searchParams }: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return <JoinRoom initialCode={code} />;
}
