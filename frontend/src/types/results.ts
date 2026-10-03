export interface RevealedAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface RevealedSubmission {
  id: string;
  text: string;
  author: RevealedAuthor;
  voterNames?: string[];
}

/** Reveal payload intentionally excludes votes, points, and rankings. */
export interface AnswerReveal {
  correctAnswer: string;
  correctVoterNames?: string[];
  submissions: RevealedSubmission[];
}

export interface RoundResultPlayer {
  id: string;
  name: string;
  avatar?: string;
  isYou: boolean;
  isHost: boolean;
  rankChange: number;
  roundPoints: number;
  totalScore: number;
}

export interface RoundResults {
  players: RoundResultPlayer[];
}

export interface FinalStanding {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  isYou: boolean;
  finalScore: number;
}

export interface FinalResults {
  standings: FinalStanding[];
}
