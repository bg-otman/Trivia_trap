// app/room/[roomCode]/page.tsx

import Room from "@/components/room/Room";

type Props = {
  params: Promise<{
    roomCode: string;
  }>;
};

export default async function RoomPage({ params }: Props) {
  const { roomCode } = await params;

  return <Room roomCode={roomCode} />;
}