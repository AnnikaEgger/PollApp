import { Service, signal } from '@angular/core';
import { Question, QuestionInsert } from '../interfaces/question.interface';
import { supabase } from './supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';

@Service()
export class QuestionService {
  questions = signal<Question[]>([]);
  questionChannel: RealtimeChannel | null = null;

  /** Loads questions for a survey and assigns display numbers. */
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
      this.questions.set(this.numberQuestions(questions ?? []));
    } catch (err) {
      console.error('Unexpected error in getQuestionsForSurvey', err);
    }
  }

  /** Inserts one question with normalized, lettered options. */
  async insertQuestion(question: QuestionInsert) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert(this.toDatabaseQuestion(question))
        .select();

      if (error) {
        console.error('Supabase error at insertQuestion:', error);
        return null;
      }
      return data?.[0];
    } catch (err) {
      console.error('Unexpected JS runtime error insertQuestion:', err);
    }
  }

  /** Updates persisted vote counts for selected options. */
  async updateVotesForQuestion(questionId: string, selectedLetters: string[]) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('options')
        .eq('id', questionId)
        .single();
      if (error || !data)
        return console.error('Fehler beim Laden der Optionen für Vote-Update:', error);
      const options = this.applyVotes(data.options ?? [], selectedLetters);
      const result = await supabase.from('questions').update({ options }).eq('id', questionId);
      if (result.error) console.error('Fehler beim Speichern der Stimme:', result.error);
    } catch (err) {
      console.error('Unerwarteter Fehler im QuestionService:', err);
    }
  }

  /** Adds one vote to each selected option. */
  private applyVotes(options: any[], selectedLetters: string[]) {
    return options.map((option, index) => ({
      ...option,
      letter: String.fromCharCode(65 + index),
      vote_count:
        (option.vote_count ?? 0) +
        (selectedLetters.includes(String.fromCharCode(65 + index)) ? 1 : 0),
    }));
  }

  /** Adds display numbers to questions returned by Supabase. */
  private numberQuestions(questions: any[]): Question[] {
    return questions.map((question, index) => ({ ...question, number: index + 1 })) as Question[];
  }

  /** Converts an application question into the database insert shape. */
  private toDatabaseQuestion(question: QuestionInsert) {
    return {
      ...question,
      options: question.options.map((option: any, index) => ({
        text: typeof option === 'string' ? option : option.text,
        letter: String.fromCharCode(65 + index),
        vote_count: typeof option === 'string' ? 0 : (option.vote_count ?? 0),
      })),
    };
  }
}
