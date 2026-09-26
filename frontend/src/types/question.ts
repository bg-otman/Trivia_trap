export type QuestionType = "TEXT" | "IMAGE";

export interface AnswerOption {
    id: string;
    label: string;
    text: string;
}

export interface Question {
    id: string;

    category: string;

    text: string;

    type: QuestionType;

    image?: string;
    imageAlt?: string;

    answers: AnswerOption[];

    correctAnswerId?: string;
}