export const players = [
  {
    id: "1",
    name: "MEHDI",
    role: "HOST" as const,
    avatar: "/avatars/avatar.png",
    status: "READY" as const,
    isYou: true,
  },
  {
    id: "2",
    name: "ALEX",
    role: "PLAYER" as const,
    avatar: "/avatars/avatar.png",
    status: "READY" as const,
    isYou: false,
  },
  {
    id: "3",
    name: "SAM",
    role: "PLAYER" as const,
    avatar: "/avatars/avatar.png",
    status: "NOT_READY" as const,
    isYou: false,
  },
  {
    id: "4",
    name: "JORDAN",
    role: "PLAYER" as const,
    avatar: "/avatars/avatar.png",
    status: "READY" as const,
    isYou: false,
  },
];
