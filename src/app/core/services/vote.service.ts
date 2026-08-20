import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  surveyQuestions = signal<any[]>([]);

  /** Loads persisted question vote data for a survey.
   * @param surveyId The survey identifier.
   */
  async getVotesForSurvey(surveyId: number | string) {
    try {
      const { data, error } = await this.fetchSurveyVotes(surveyId);
      if (error) {
        console.error('Supabase error at getVotesForSurvey:', error);
        this.surveyQuestions.set([]);
        return;
      }

      this.surveyQuestions.set(data ?? []);
    } catch (err) {
      console.error('Unexpected JS runtime error at getVotesForSurvey:', err);
      this.surveyQuestions.set([]);
    }
  }

  /** Persists one submitted vote for the selected option letters.
   * @param questionId The question identifier.
   * @param selectedLetters The selected option letters.
   * @returns Whether the vote was persisted.
   */
  async voteForOptions(questionId: number | string, selectedLetters: string[]) {
    try {
      const { data: questionData, error: fetchError } = await this.fetchQuestion(questionId);
      if (fetchError || !questionData) {
        console.error('Supabase error fetching question for vote:', fetchError);
        return false;
      }

      return this.persistVotes(questionId, this.applyVotes(questionData.options, selectedLetters));
    } catch (err) {
      console.error('Unexpected JS runtime error at voteForOptions:', err);
      return false;
    }
  }

  /** Fetches one question for vote persistence.
   * @param questionId The question identifier.
   * @returns The Supabase query for the question options.
   */
  private fetchQuestion(questionId: number | string) {
    return supabase.from('questions').select('options').eq('id', questionId).single();
  }

  /** Fetches all questions used by the results view.
   * @param surveyId The survey identifier.
   * @returns The Supabase query for survey questions.
   */
  private fetchSurveyVotes(surveyId: number | string) {
    return supabase.from('questions').select('*').eq('survey_id', surveyId);
  }

  /** Writes updated option counts to the database.
   * @param questionId The question identifier.
   * @param options The options with updated counts.
   * @returns Whether the updated counts were persisted.
   */
  private async persistVotes(questionId: number | string, options: any[]): Promise<boolean> {
    const { error } = await supabase.from('questions').update({ options }).eq('id', questionId);
    if (error) console.error('Supabase error updating vote counts:', error);
    return !error;
  }

  /** Returns options with submitted votes added to their counts.
   * @param options The options to update.
   * @param selectedLetters The selected option letters.
   * @returns The options with updated vote counts.
   */
  private applyVotes(options: any[], selectedLetters: string[]) {
    return options.map((option, index) => {
      const letter = String.fromCharCode(65 + index);
      const vote_count = (option.vote_count || 0) + (selectedLetters.includes(letter) ? 1 : 0);
      return { ...option, letter, vote_count };
    });
  }
}
