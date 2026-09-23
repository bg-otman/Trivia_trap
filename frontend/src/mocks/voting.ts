import type { VotingOption } from "@/types/question";

// Already randomized by the server. The client receives no correctness or
// authorship metadata during voting.
export const mockVotingOptions: VotingOption[] = [
  { id: "choice_5f2a", text: "The Sunken Obelisk" },
  { id: "choice_91bc", text: "Hanging Gardens of Babylon" },
  { id: "choice_2dd4", text: "The Golden Temple Terraces" },
  { id: "choice_a703", text: "The Tower Gardens of Nineveh" },
  { id: "choice_6c18", text: "The Colossus Gardens" },
  { id: "choice_e459", text: "The Euphrates Stone Steps" },
  { id: "choice_34af", text: "The Palace of Semiramis" },
];

export const mockVotingProgress = {
  votesSubmitted: 4,
  totalVoters: 6,
};
