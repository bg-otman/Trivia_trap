export interface RevealedAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface RevealedSubmission {
  id: string;
  text: string;
  author: RevealedAuthor;
}

/** Reveal payload intentionally excludes votes, points, and rankings. */
export interface AnswerReveal {
  correctAnswer: string;
  submissions: RevealedSubmission[];
}
