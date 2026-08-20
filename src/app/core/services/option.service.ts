import { Service, signal, inject } from '@angular/core';
import { Option } from '../interfaces/option.interface';
import { supabase } from './supabase.client';
import { QuestionService } from './question.service';

@Service()
export class OptionService {
  options = signal<Option[]>([]);
  questionService = inject(QuestionService);
  questions = this.questionService.questions;

  /** Loads options for one question.
   * @param questionId The question identifier.
   * @returns The question options.
   */
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

  /** Loads and normalizes every option belonging to a survey.
   * @param surveyId The survey identifier.
   */
  async getOptionsForSurvey(surveyId: string): Promise<void> {
    try {
      const { data, error } = await this.fetchSurveyOptions(surveyId);
      if (error) {
        console.error('getOptionsForSurvey error:', error);
        this.options.set([]);
        return;
      }

      this.options.set(this.mapOptions(data ?? []));
    } catch (err) {
      console.error('Unexpected error in getOptionsForSurvey:', err);
      this.options.set([]);
    }
  }

  /** Fetches all question option arrays for a survey.
   * @param surveyId The survey identifier.
   * @returns The Supabase query for survey options.
   */
  private fetchSurveyOptions(surveyId: string) {
    return supabase.from('questions').select('options').eq('survey_id', surveyId);
  }

  /** Appends an option to a question and persists the updated option list.
   * @param optionText The option text.
   * @param questionId The question identifier.
   * @returns Whether the updated options were persisted.
   */
  async insertOptions(optionText: string, questionId: number): Promise<boolean> {
    try {
      const options = await this.fetchQuestionOptions(questionId);
      return options
        ? this.updateQuestionOptions(questionId, [...options, { text: optionText }])
        : false;
    } catch (err) {
      console.error('Unexpected JS runtime error at insertOptions', err);
      return false;
    }
  }

  /** Maps database options to stable lettered option values.
   * @param questions The question rows containing options.
   * @returns The flattened, lettered options.
   */
  private mapOptions(questions: any[]): Option[] {
    return questions
      .flatMap((q) => q.options ?? [])
      .map((opt: any, index: number) => ({
        ...opt,
        letter: String.fromCharCode(65 + index),
      })) as Option[];
  }

  /** Fetches the current options for one question.
   * @param questionId The question identifier.
   * @returns The current options, or null when loading fails.
   */
  private async fetchQuestionOptions(questionId: number): Promise<any[] | null> {
    const { data, error } = await supabase
      .from('questions')
      .select('options')
      .eq('id', questionId)
      .single();
    if (error) console.error('Supabase error at insertOptions (fetch):', error);
    return error ? null : (data?.options ?? []);
  }

  /** Persists a question's complete option list.
   * @param questionId The question identifier.
   * @param options The complete option list.
   * @returns Whether the options were persisted.
   */
  private async updateQuestionOptions(questionId: number, options: any[]): Promise<boolean> {
    const { error } = await supabase.from('questions').update({ options }).eq('id', questionId);
    if (error) console.error('Supabase error at insertOptions (update):', error);
    return !error;
  }
}
