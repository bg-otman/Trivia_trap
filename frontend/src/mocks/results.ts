import type { AnswerReveal } from "@/types/results";

export const mockAnswerReveal: AnswerReveal = {
  correctAnswer: "Hanging Gardens of Babylon",
  submissions: [
    {
      id: "trap_mehdi",
      text: "The Sunken Obelisk",
      author: { id: "mehdi", name: "MEHDI" },
    },
    {
      id: "trap_alex",
      text: "The Golden Temple Terraces",
      author: { id: "alex", name: "ALEX" },
    },
    {
      id: "trap_sarah",
      text: "The Tower Gardens of Nineveh",
      author: { id: "sarah", name: "SARAH" },
    },
    {
      id: "trap_yassine",
      text: "The Colossus Gardens",
      author: { id: "yassine", name: "YASSINE" },
    },
    {
      id: "trap_adam",
      text: "The Euphrates Stone Steps",
      author: { id: "adam", name: "ADAM" },
    },
    {
      id: "trap_sam",
      text: "The Palace of Semiramis",
      author: { id: "sam", name: "SAM" },
    },
  ],
};

export const mockRoundResults = {
  players: [
    {
      id: "alex",
      name: "ALEX",
      isYou: false,
      isHost: false,
      rankChange: -1,
      roundPoints: 0,
      totalScore: 1000,
    },
    {
      id: "mehdi",
      name: "MEHDI",
      isYou: true,
      isHost: true,
      rankChange: -1,
      roundPoints: 0,
      totalScore: 900,
    },
    {
      id: "sarah",
      name: "SARAH",
      isYou: false,
      isHost: false,
      rankChange: 2,
      roundPoints: 400,
      totalScore: 1100,
    },
  ],
} satisfies import("@/types/results").RoundResults;

export const mockFinalResults = {
  standings: [
    { id: "sarah", rank: 1, name: "SARAH", isYou: false, finalScore: 18 },
    { id: "mehdi", rank: 2, name: "MEHDI", isYou: true, finalScore: 15 },
    { id: "sam", rank: 3, name: "SAM", isYou: false, finalScore: 12 },
    { id: "alex", rank: 4, name: "ALEX", isYou: false, finalScore: 10 },
    { id: "adam", rank: 5, name: "ADAM", isYou: false, finalScore: 8 },
    { id: "yassine", rank: 6, name: "YASSINE", isYou: false, finalScore: 6 },
  ],
} satisfies import("@/types/results").FinalResults;
