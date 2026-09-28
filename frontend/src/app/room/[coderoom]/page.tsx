import { notFound } from "next/navigation";
import { TriviaTrapGame } from "@/components/game/trivia-trap-game";
import { findMockRoom } from "@/mocks/rooms";

interface GamePageProps {
  params: Promise<{ coderoom: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { coderoom } = await params;
  const roomCode = decodeURIComponent(coderoom).trim().toUpperCase();
  const room = findMockRoom(roomCode);

  if (!room || room.status !== "open") notFound();

  return <TriviaTrapGame roomCode={room.code} />;
}
