import type { AnswerReveal } from "@/types/results";

export const mockAnswerReveal: AnswerReveal = {
  correctAnswer: "Hanging Gardens of Babylon",
  submissions: [
    { id: "trap_mehdi", text: "The Sunken Obelisk", author: { id: "mehdi", name: "MEHDI" } },
    { id: "trap_alex", text: "The Golden Temple Terraces", author: { id: "alex", name: "ALEX" } },
    { id: "trap_sarah", text: "The Tower Gardens of Nineveh", author: { id: "sarah", name: "SARAH" } },
    { id: "trap_yassine", text: "The Colossus Gardens", author: { id: "yassine", name: "YASSINE" } },
    { id: "trap_adam", text: "The Euphrates Stone Steps", author: { id: "adam", name: "ADAM" } },
    { id: "trap_sam", text: "The Palace of Semiramis", author: { id: "sam", name: "SAM" } },
  ],
};
