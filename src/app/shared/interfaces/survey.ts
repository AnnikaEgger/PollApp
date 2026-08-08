export interface Option {
  text: string;
  selected: boolean;
  questionId: number;
}

export interface Question {
  question: string;
  allowMultipleAnswers: boolean;
  surveyId: number;
}

export interface Survey {
  title: string;
  category: string;
  description: string;
  end_date: Date;
}
