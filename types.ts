import type { RowDataPacket } from 'mysql2';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

//Type to pass around answer information without passing around answers
interface Answer {
  answerId: number;
  answerText: string;
}

//Type to pass around, including the Answers as part of the question
interface Question {
  questionId: number;
  questionText: string;
  answers: Answer[];
}

//Type to keep track of the information that needs to be displayed on leaderboard
interface Score {
  userId: number;
  username : string;
  correctCount: number;
  score: number;
  cityName: string;
}

//Function that represents a Database entry in the City database
interface CityEntry extends RowDataPacket {
  cityId: number;
  cityName: string;
  historyText: string;
  factsText: string;
  cityBanner: string;
}

//Function that represents a Database entry in the User database
interface UserEntry extends RowDataPacket {
  userId: number;
  username: string;
  passwordHash: string;
  profilePic: Buffer | null;
  isPublic: boolean;
  isAdmin: boolean;
  themeLight: boolean;
  isActive: boolean;
}

//Function that represents a Database entry in the Question database
interface QuestionEntry extends RowDataPacket {
  questionId: number;
  cityId: number;
  questionText: string;
}

//Function that represents a Database entry in the Answer database
interface AnswerEntry extends RowDataPacket {
  answerId: number;
  questionId: number;
  choiceText: string;
  isCorrect: boolean;
}

//Function that represents a Database entry in the Score database
interface ScoreEntry extends RowDataPacket {
  scoreId: number;
  userId: number;
  cityId: number;
  correctCount: number;
  score: number;
  timeCompleted: number;
  isPublic: boolean;
}

export {
  Answer,
  Question,
  CityEntry,
  UserEntry,
  QuestionEntry,
  AnswerEntry,
  ScoreEntry,
  Score
}
