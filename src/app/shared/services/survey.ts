import { Service, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../../environments/environment';
import { Survey, Question, Answer, SurveyDB } from '../interfaces/survey';

@Service()
export class SurveyService {
  supabase = createClient(env.supabase_url, env.supabase_key);
  private route = inject(ActivatedRoute);

  currentSurveyId: string | null;
  currentSurvey = signal<Survey>({
    title: '',
    description: '',
    category: 'Everyday Life',
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  currentQuestions = signal<Question[]>([
    {
      question: '',
      allowMultipleAnswers: false,
      surveyId: 0,
      answers: [],
    },
  ]);

  constructor() {
    this.currentSurveyId = this.route.snapshot.paramMap.get('surveyId');
    this.getSurvey(6);
  }

  async getSurvey(surveyId: number) {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();
    this.currentSurvey.set(data);
    this.getQuestions(data);
  }

  async getQuestions(survey: SurveyDB) {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('surveyId', survey.id);

    if (data) this.currentQuestions.set(data);
  }

  async deleteQuestions() {
    const { error } = await this.supabase.from('questions').delete();
  }

  async insertSurvey(survey: Survey) {
    const response = await this.supabase.from('surveys').insert([survey]).select();
  }

  insertQuestions(questions: Question[]) {
    questions.forEach((question) => this.insertQuestion(question));
  }

  async insertQuestion(question: Question) {
    const response = await this.supabase.from('questions').insert([question]).select();
  }
}
