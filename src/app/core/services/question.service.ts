import { Service, signal } from '@angular/core';
import { Question } from '../interfaces/question.interface';
import { supabase } from './supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';

@Service()
export class QuestionService {
  questions = signal<Question[]>([]);
  questionChannel: RealtimeChannel | null = null;

  async getQuestionsForSurvey(surveyId: string) {
    try {
      let { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', surveyId);

      if (error) {
        console.error('getQuestionsForSurvey error:', error);
        this.questions.set([]);
        return;
      }

      const mappedQuestions = (questions ?? []).map((q, index) => ({
        ...q,
        number: index + 1,
      }));

      this.questions.set(mappedQuestions as Question[]);
    } catch (err) {
      console.error('Unexpected error in getQuestionsForSurvey', err);
    }
  }

  async insertQuestion(question: any, surveyId: number) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          survey_id: surveyId,
          number: question.number,
          text: question.text,
          allow_multiple: question.allow_multiple,
        })
        .select();
      if (error) {
        console.error('Supabase error at insertQuestion:', error);
      }
      return data?.[0];
    } catch (err) {
      console.error('Unexpected JS runtime error insertQuestion:', err);
    }
  }

  async updateVotesForQuestion(questionId: string, selectedLetters: string[]) {
    try {
      const { data, error: fetchError } = await supabase
        .from('questions')
        .select('options')
        .eq('id', questionId)
        .single();

      if (fetchError || !data) {
        console.error('Fehler beim Laden der Optionen für Vote-Update:', fetchError);
        return;
      }

      const rawOptions = data.options ?? [];

      const updatedOptions = rawOptions.map((opt: any, index: number) => {
        const currentLetter = String.fromCharCode(65 + index); // A, B, C...

        if (selectedLetters.includes(currentLetter)) {
          return {
            ...opt,
            vote_count: (opt.vote_count ?? 0) + 1,
          };
        }
        return opt;
      });

      const { error: updateError } = await supabase
        .from('questions')
        .update({ options: updatedOptions })
        .eq('id', questionId);

      if (updateError) {
        console.error('Fehler beim Speichern der Stimme:', updateError);
      }
    } catch (err) {
      console.error('Unerwarteter Fehler im QuestionService:', err);
    }
  }
}
