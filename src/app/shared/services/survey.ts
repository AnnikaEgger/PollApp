import { Service } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../../environment';
import { Survey, Question, Option } from '../interfaces/survey';

@Service()
export class SurveyService {
  supabase = createClient(env.supabase_url, env.supabase_key);

  surveys: Survey[] = [];

  categories: string[] = ['Technology & Future', 'Everyday Life', 'Society & Politics'];

  constructor() {
    // this.insertSurvey(this.survey1);
    // this.insertQuestions(this.questions1);
    // this.insertOptions(this.optionsQuestion1);
    // this.insertOptions(this.optionsQuestion2);
    // this.insertOptions(this.optionsQuestion3);
    // this.insertOptions(this.optionsQuestion4);
    // this.deleteOptions();
  }

  async deleteOptions() {
    const { error } = await this.supabase.from('options').delete().eq('selected', false);
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

  insertOptions(options: Option[]) {
    options.forEach((option) => this.insertOption(option));
  }

  async insertOption(option: Option) {
    const response = await this.supabase.from('options').insert([option]).select();
  }

  survey1: Survey = {
    title: 'Getting Around',
    category: 'Everyday Life',
    description:
      'How do people get around in their everyday lives, and what influences their choice of transportation?',
    end_date: new Date('2026-09-30'),
  };

  questions1: Question[] = [
    {
      question: 'What is your main way of getting around in everyday life?',
      allowMultipleAnswers: false,
      surveyId: 6,
    },
    {
      question: 'What matters most to you when choosing how to travel?',
      allowMultipleAnswers: false,
      surveyId: 6,
    },
    {
      question: 'What would make you use public transport more often?',
      allowMultipleAnswers: false,
      surveyId: 6,
    },
    {
      question: 'For a journey of around 5 km, which option would you prefer?',
      allowMultipleAnswers: false,
      surveyId: 6,
    },
  ];

  optionsQuestion1: Option[] = [
    { text: 'Car', selected: false, questionId: 5 },
    { text: 'Public transport', selected: false, questionId: 5 },
    { text: 'Bicycle', selected: false, questionId: 5 },
    { text: 'Walking', selected: false, questionId: 5 },
  ];

  optionsQuestion2: Option[] = [
    { text: 'Price', selected: false, questionId: 6 },
    { text: 'Travel time', selected: false, questionId: 6 },
    { text: 'Convenience', selected: false, questionId: 6 },
    { text: 'Environmental impact', selected: false, questionId: 6 },
  ];

  optionsQuestion3: Option[] = [
    { text: 'Lower prices', selected: false, questionId: 7 },
    { text: 'More frequent connections', selected: false, questionId: 7 },
    { text: 'Better reliability', selected: false, questionId: 7 },
    { text: 'Better connections to my destination', selected: false, questionId: 7 },
    { text: 'Nothing', selected: false, questionId: 7 },
  ];

  optionsQuestion4: Option[] = [
    { text: 'Car', selected: false, questionId: 8 },
    { text: 'Public transport', selected: false, questionId: 8 },
    { text: 'Bicycle', selected: false, questionId: 8 },
    { text: 'Walking', selected: false, questionId: 8 },
  ];
}
