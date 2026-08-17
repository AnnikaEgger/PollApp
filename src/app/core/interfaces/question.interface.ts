import { Option } from './option.interface';

export interface Question {
  id: string;
  created_at: string;
  survey_id: string;
  text: string;
  multiple_answers_allowed: boolean;
  number: string;
  options: Option[];
}

export interface QuestionInsert {
  survey_id: string;
  text: string;
  multiple_answers_allowed: boolean;
  number: string;
  options: Option[];
}
