import { categoriesLiteral } from '../../shared/literals/literals';

export interface Answer {
  text: string;
  voteCount: number;
}

export interface Question {
  question: string;
  allowMultipleAnswers: boolean;
  surveyId: number;
  answers: Answer[];
}

export interface Survey {
  title: string;
  category: categoriesLiteral;
  description: string;
  end_date: string;
}

export interface SurveyDB extends Survey {
  id: number;
  created_at: string;
}
