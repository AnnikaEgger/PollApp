import { Option } from './option.interface';

export interface Question {
  id: string;
  created_at: string;
  survey_id: string;
  text: string;
  allow_multiple: boolean;
  number: string;
  options: Option[];
}
