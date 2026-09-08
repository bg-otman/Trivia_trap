import RoomLobby from "@/components/room/RoomLobby";

type RoomPageProps = {
  params: Promise<{
    roomCode: string;
  }>;
};

export default async function RoomPage({
  params,
}: RoomPageProps) {
  const { roomCode } = await params;

  return <RoomLobby roomCode={roomCode} />;
}