import { Service, signal } from '@angular/core';
import { Survey } from '../interfaces/survey.interface';
import { supabase } from './supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';

@Service()
export class SurveyService {
  surveys = signal<Survey[]>([]);
  singleSurvey = signal<Survey | null>(null);
  surveyChannel: RealtimeChannel | null = null;
  dialogIsOpen = signal<boolean>(false);

  /** Loads all surveys when the service is created. */
  constructor() {
    this.getAllSurveys();
  }

  /** Opens or closes the create-survey dialog. */
  toggleCreateSurveyDialog() {
    this.dialogIsOpen.update((value) => !value);
  }

  /** Loads all surveys from Supabase. */
  async getAllSurveys() {
    try {
      let { data: surveys, error } = await supabase.from('surveys').select('*');
      if (error) console.error('Supabase error at getAllSurveys:', error);
      this.surveys.set(surveys ?? ([] as Survey[]));
    } catch (err) {
      console.error('Unexpected JS runtime error at getAllSurveys', err);
    }
  }

  /** Loads one survey by its identifier. */
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

  /** Inserts a published survey and returns the created row. */
  async insertSurvey(survey: any) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert(this.toSurveyRow(survey))
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

  /** Selects the fields required for a published survey row. */
  private toSurveyRow(survey: any) {
    return {
      title: survey.title,
      description: survey.description,
      category: survey.category,
      end_date: survey.end_date,
      published: true,
    };
  }
}
