import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  surveyQuestions = signal<any[]>([]);

  async getVotesForSurvey(surveyId: number | string) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', surveyId);

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

  async voteForOptions(questionId: number | string, selectedLetters: string[]) {
    try {
      const { data: questionData, error: fetchError } = await supabase
        .from('questions')
        .select('options')
        .eq('id', questionId)
        .single();

      if (fetchError || !questionData) {
        console.error('Supabase error fetching question for vote:', fetchError);
        return false;
      }

      const updatedOptions = questionData.options.map((opt: any, index: number) => {
        const currentLetter = String.fromCharCode(65 + index);

        if (selectedLetters.includes(currentLetter)) {
          return {
            ...opt,
            letter: currentLetter,
            vote_count: (opt.vote_count || 0) + 1,
          };
        }
        return { ...opt, letter: currentLetter };
      });

      const { error: updateError } = await supabase
        .from('questions')
        .update({ options: updatedOptions })
        .eq('id', questionId);

      if (updateError) {
        console.error('Supabase error updating vote counts:', updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected JS runtime error at voteForOptions:', err);
      return false;
    }
  }
}
