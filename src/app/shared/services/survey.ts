import { Service, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../../environment';
import { Survey, Question, Answer, SurveyDB, QuestionWithAnswer } from '../interfaces/survey';

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

  currentQuestions = signal<QuestionWithAnswer[]>([
    {
      question: '',
      allowMultipleAnswers: false,
      surveyId: 0,
      answers: [],
      id: 0,
      created_at: '',
    },
  ]);

  currentAnswers = signal<Answer[]>([
    {
      text: 'string',
      selected: false,
      questionId: 0,
    },
  ]);

  constructor() {
    this.currentSurveyId = this.route.snapshot.paramMap.get('surveyId');

    // console.log(this.currentSurvey);

    this.getSurvey(5);
    // this.insertSurvey(this.survey1);
    // this.insertQuestions(this.questions1);
    // this.insertOptions(this.optionsQuestion1);
    // this.insertOptions(this.optionsQuestion2);
    // this.insertOptions(this.optionsQuestion3);
    // this.insertOptions(this.optionsQuestion4);
    // this.deleteOptions();
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

    if (data) {
      const questionsWithAnswers: QuestionWithAnswer[] = data.map((question: any) => ({
        ...question,
        answers: [],
      }));

      this.currentQuestions.set(questionsWithAnswers);
    }

    this.getAnswersf();
  }

  async getAnswersf() {
    const questions = this.currentQuestions();

    const updatedQuestions = await Promise.all(
      questions.map(async (question) => {
        const answers = await this.getAnswers(question);
        return {
          ...question,
          answers: answers,
        };
      }),
    );

    this.currentQuestions.set(updatedQuestions);
    console.log(this.currentQuestions());
  }

  async getAnswers(question: QuestionWithAnswer) {
    const { data, error } = await this.supabase
      .from('answers')
      .select('*')
      .eq('questionId', question.id);

    return data ?? [];
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

  insertOptions(answers: Answer[]) {
    answers.forEach((answer) => this.insertOption(answer));
  }

  async insertOption(answer: Answer) {
    const response = await this.supabase.from('answers').insert([answer]).select();
  }
}
