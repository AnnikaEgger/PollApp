import { Service, signal } from '@angular/core';
import { Survey } from '../interfaces/survey.interface';
import { supabase } from './supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';

@Service()
export class SurveyService {
  surveys = signal<Survey[]>([]);
  singleSurvey = signal<Survey | null>(null);
  surveyChannel: RealtimeChannel | null = null;

  constructor() {
    this.getAllSurveys();
  }

  async getAllSurveys() {
    try {
      let { data: surveys, error } = await supabase.from('surveys').select('*');
      if (error) console.error('Supabase error at getAllSurveys:', error);
      this.surveys.set(surveys ?? ([] as Survey[]));
    } catch (err) {
      console.error('Unexpected JS runtime error at getAllSurveys', err);
    }
  }

  async getSingleSurvey(id: string) {
    try {
      let { data: survey, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error('Supabase error at getSingleSurvey:', error);
      this.singleSurvey.set(survey);
      return survey;
    } catch (err) {
      console.error('Unexpected JS runtime error in getSingleSurvey:', err);
      return null;
    }
  }

  async insertSurvey(survey: any) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          title: survey.title,
          description: survey.description,
          category: survey.category,
          end_date: survey.end_date,
          published: survey.published,
        })
        .select();
      if (error) {
        console.error('Supabase error at insertSurvey:', error);
        return;
      }
      return data?.[0];
    } catch (err) {
      console.error('Unexpected JS runtime error at insertSurvey:', err);
    }
  }
}
