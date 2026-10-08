import { notFound } from "next/navigation";
import { TriviaTrapGame } from "@/components/game/trivia-trap-game";
import { findMockRoom } from "@/mocks/rooms";
import { requireUser } from "@/lib/require-user";

interface GamePageProps {
  params: Promise<{ coderoom: string }>;
  searchParams: Promise<{ state?: string }>;
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const [{ coderoom }, query] = await Promise.all([params, searchParams]);
  const roomCode = decodeURIComponent(coderoom).trim().toUpperCase();
  await requireUser(`/room/${encodeURIComponent(roomCode)}`);
  if (process.env.NODE_ENV === "development" && query.state) {
    const room = findMockRoom(roomCode);
    if (!room || room.status !== "open") notFound();
    return <TriviaTrapGame roomCode={room.code} mockState={query.state} />;
  }

  return <TriviaTrapGame roomCode={roomCode} roomId={roomCode} />;
}
