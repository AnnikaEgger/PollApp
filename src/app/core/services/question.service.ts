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
}
