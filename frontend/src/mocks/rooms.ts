export type MockRoomStatus = "open" | "full";

export interface MockRoom {
  code: string;
  name: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: MockRoomStatus;
}

const mockRooms: MockRoom[] = [
  {
    code: "X7K9P2",
    name: "Friday Night Brain Battle",
    hostName: "Maya",
    playerCount: 6,
    maxPlayers: 10,
    status: "open",
  },
  {
    code: "ABC123",
    name: "Weekend Trivia Club",
    hostName: "Mehdi",
    playerCount: 6,
    maxPlayers: 10,
    status: "open",
  },
  {
    code: "FULL42",
    name: "The Final Braincell",
    hostName: "Alex",
    playerCount: 10,
    maxPlayers: 10,
    status: "full",
  },
];

export function findMockRoom(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  return mockRooms.find((room) => room.code === normalizedCode) ?? null;
}
