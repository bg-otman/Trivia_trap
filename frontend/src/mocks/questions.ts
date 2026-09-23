import type { Question } from "@/types/question";

export const mockQuestions: Question[] = [
  // {
  //   id: "ancient-wonders",
  //   category: "HISTORY & ARCHAEOLOGY",
  //   text: "Which ancient wonder was located in the city of Babylon and celebrated for its tiered stone terraces?",
  //   type: "TEXT",
  //   answers: [
  //     { id: "A", label: "Hanging Gardens", text: "Hanging Gardens" },
  //     { id: "B", label: "The Sunken Obelisk", text: "The Sunken Obelisk" },
  //     { id: "C", label: "Golden Temple", text: "Golden Temple" },
  //     { id: "D", label: "Colossus of Rhodes", text: "Colossus of Rhodes" },
  //   ],
  //   correctAnswerId: "A",
  // },
  {
    id: "question-image-test",
    category: "HISTORY & ARCHAEOLOGY",
    type: "IMAGE",

    text: "Which ancient wonder is shown in this image?",

    image: "/avatars/avatar.png",
    imageAlt: "Ancient historical site",

    answers: [],

    correctAnswerId: "hidden",
  }
];

