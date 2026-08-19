export interface Answer {
  text: string;
  vote_count: number;
}

export interface Question {
  question: string;
  allowMultipleAnswers: boolean;
  surveyId: number;
  answers: Answer[];
}

export interface QuestionDB extends Question {
  id: number;
  created_at: string;
}

export interface Survey {
  title: string;
  category: string;
  description: string;
  end_date: string;
}

export interface SurveyDB extends Survey {
  id: number;
  created_at: string;
}
