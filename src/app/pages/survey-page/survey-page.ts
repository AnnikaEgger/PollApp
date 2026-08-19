import { Component, computed, inject, signal } from '@angular/core';
import { SurveySheet } from '../../features/survey-sheet/survey-sheet';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { VoteService } from '../../core/services/vote.service';
import { QuestionService } from '../../core/services/question.service';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyResults } from '../../features/survey-results/survey-results';
import { CreateSurveyBtn } from '../../shared/components/create-survey-btn/create-survey-btn';
import { CreateSurveyPage } from '../create-survey-page/create-survey/create-survey';

@Component({
  selector: 'app-survey-page',
  imports: [SurveySheet, RouterLink, SurveyResults, CreateSurveyBtn, CreateSurveyPage],
  templateUrl: './survey-page.html',
  styleUrl: './survey-page.scss',
})
export class SurveyPage {
  private route = inject(ActivatedRoute);
  questionService = inject(QuestionService);
  voteService = inject(VoteService);
  surveyService = inject(SurveyService);
  router = inject(Router);

  questions = this.questionService.questions;
  isPastSurvey: boolean = false;
  isCreateSurveyOpen: boolean = false;
  showResultsMobile: boolean = true;
  userHasVoted: boolean = false;
  answers = signal(new Map<string, string[]>());
  displayedQuestions = computed(() =>
    this.questions().map((question) => {
      const selectedLetters = this.answers().get(question.id) ?? [];

      return {
        ...question,
        options: question.options.map((option) => ({
          ...option,
          vote_count: (option.vote_count ?? 0) + (selectedLetters.includes(option.letter) ? 1 : 0),
        })),
      };
    }),
  );

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const surveyId = params.get('id');
      if (surveyId) {
        await this.surveyService.getSingleSurvey(surveyId);
        await this.questionService.getQuestionsForSurvey(surveyId);
        this.userHasVoted = localStorage.getItem(`survey_voted_${surveyId}`) === 'true';
      }
    });
  }

  async ngAfterViewInit() {
    const surveyId = this.route.snapshot.paramMap.get('id')!;

    const survey = await this.surveyService.getSingleSurvey(surveyId);
    if (survey) {
      setTimeout(() => {
        this.computeIsPast(survey.end_date);
      });
    }
  }

  private computeIsPast(endDate: string) {
    if (!endDate) {
      this.isPastSurvey = false;
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    this.isPastSurvey = end < today;
  }

  optionsForQuestion(qId: number | string) {
    const question = this.questions().find((q) => q.id == qId);
    return question?.options ?? [];
  }

  hasVotes() {
    return this.questions().some((q) => q.options?.some((o: any) => (o.vote_count || 0) > 0));
  }

  hasLocalVotes() {
    for (const optionIds of this.answers().values()) {
      if (optionIds.length > 0) return true;
    }
    return false;
  }

  async completeSurvey() {
    const surveyId = this.route.snapshot.paramMap.get('id')!;
    if (!surveyId) return;

    for (const [questionId, selectedLetters] of this.answers().entries()) {
      if (selectedLetters.length > 0) {
        await this.voteService.voteForOptions(questionId, selectedLetters);
      }
    }

    localStorage.setItem(`survey_voted_${surveyId}`, 'true');
    this.userHasVoted = true;
    this.answers.set(new Map<string, string[]>());

    await this.questionService.getQuestionsForSurvey(surveyId);
  }

  onSelectionChanged(event: { questionId: string; optionIds: string[] }) {
    this.answers.update((answers) => {
      const updatedAnswers = new Map(answers);
      updatedAnswers.set(event.questionId, event.optionIds);
      return updatedAnswers;
    });
  }

  openCreateSurveyModal() {
    this.isCreateSurveyOpen = true;
  }
}
