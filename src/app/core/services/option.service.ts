import { Service, signal, inject } from '@angular/core';
import { Option } from '../interfaces/option.interface';
import { supabase } from './supabase.client';
import { QuestionService } from './question.service';

@Service()
export class OptionService {
  options = signal<Option[]>([]);
  questionService = inject(QuestionService);
  questions = this.questionService.questions;

  async getOptionsForQuestion(questionId: string): Promise<Option[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('options')
      .eq('id', questionId)
      .single();

    if (error) {
      console.error('Fehler beim Laden der Optionen:', error);
      return [];
    }

    return data?.options ?? [];
  }

  async getOptionsForSurvey(surveyId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('options')
        .eq('survey_id', surveyId);

      if (error) {
        console.error('getOptionsForSurvey error:', error);
        this.options.set([]);
        return;
      }

      const allOptions = (data ?? []).flatMap((q) => q.options ?? []);

      const mappedOptions = allOptions.map((opt: any, index: number) => ({
        ...opt,
        letter: String.fromCharCode(65 + index),
      }));

      this.options.set(mappedOptions as Option[]);
    } catch (err) {
      console.error('Unexpected error in getOptionsForSurvey:', err);
      this.options.set([]);
    }
  }

  async insertOptions(optionText: string, questionId: number): Promise<boolean> {
    try {
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('options')
        .eq('id', questionId)
        .single();

      if (fetchError) {
        console.error('Supabase error at insertOptions (fetch):', fetchError);
        return false;
      }

      const currentOptions = question?.options ?? [];

      const updatedOptions = [
        ...currentOptions,
        {
          text: optionText,
        },
      ];

      const { error } = await supabase
        .from('questions')
        .update({ options: updatedOptions })
        .eq('id', questionId);

      if (error) {
        console.error('Supabase error at insertOptions (update):', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected JS runtime error at insertOptions', err);
      return false;
    }
  }
}
