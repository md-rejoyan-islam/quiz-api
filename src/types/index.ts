export enum QUIZ_SET_LABEL {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum QUIZ_SET_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export interface QUIZ_SET_RATING {
  id: string;
  userId: string;
  quizId: string;
  rating: number; //from 0 to 5
  createdAt: string;
  updatedAt: string;
  user?: USER;
  quiz?: QUIZ_SET;
}

export interface QUESTION {
  id: string;
  quizSetId: string;
  question: string;
  options: (string | number)[];
  correctAnswers: number[];
  explanation: string | null;
  mark: number;
  time: number;
  createdAt: string;
  updatedAt: string;
  quizSet?: QUIZ_SET;
}

export interface QUIZ_SET {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: QUIZ_SET_STATUS;
  label: QUIZ_SET_LABEL;
  userId: string;
  createdAt: string;
  updatedAt: string;
  questions: QUESTION[];
  ratings?: QUIZ_SET_RATING[];
  attempts?: ATTEMPT[];
  user?: USER;
}

export interface ATTEMPT {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  createdAt: string;
  updatedAt: string;
  submittedAnswers: SUBMITTED_ANSWER[];
  user?: USER;
  quiz?: QUIZ_SET;
}

export enum USER_ROLE {
  ADMIN = "admin",
  USER = "user",
}

export interface USER {
  id: string;
  fullName: string;
  email: string;
  bio: string | null;
  password: string;
  photo: string | null;
  role: USER_ROLE;
  quizSets?: QUIZ_SET[];
  attempts?: ATTEMPT[];
  createdAt: string;
  updatedAt: string;
}

export interface SUBMITTED_ANSWER {
  questionId: string;
  selectedAnswers: string[];
}
