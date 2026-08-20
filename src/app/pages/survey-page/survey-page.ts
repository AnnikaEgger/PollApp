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
  isSubmittingSurvey: boolean = false;
  isSurveySubmitted: boolean = false;
  answers = signal(new Map<string, string[]>());
  displayedQuestions = computed(() =>
    this.questions().map((question) => {
      const selectedLetters = this.answers().get(question.id) ?? [];

      return {
        ...question,
        options: (question.options ?? []).map((option, index) => {
          const letter = String.fromCharCode(65 + index);

          return {
            ...option,
            letter,
            vote_count: (option.vote_count ?? 0) + (selectedLetters.includes(letter) ? 1 : 0),
          };
        }),
      };
    }),
  );

  /** Loads the survey, questions, and browser vote state. */
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

  /** Loads the survey end date after the view initializes. */
  async ngAfterViewInit() {
    const surveyId = this.route.snapshot.paramMap.get('id')!;

    const survey = await this.surveyService.getSingleSurvey(surveyId);
    if (survey) {
      setTimeout(() => {
        this.computeIsPast(survey.end_date);
      });
    }
  }

  /** Updates the expired state from a survey end date.
   * @param endDate The survey end date.
   */
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

  /** Returns options belonging to a question.
   * @param qId The question identifier.
   * @returns The question options.
   */
  optionsForQuestion(qId: number | string) {
    const question = this.questions().find((q) => q.id == qId);
    return question?.options ?? [];
  }

  /** Indicates whether persisted votes exist.
   * @returns Whether persisted votes exist.
   */
  hasVotes() {
    return this.questions().some((q) => q.options?.some((o: any) => (o.vote_count || 0) > 0));
  }

  /** Indicates whether local selections exist.
   * @returns Whether local selections exist.
   */
  hasLocalVotes() {
    for (const optionIds of this.answers().values()) {
      if (optionIds.length > 0) return true;
    }
    return false;
  }

  /** Indicates whether every question has at least one selected option.
   * @returns Whether every question has a selected option.
   */
  hasAnsweredEveryQuestion() {
    const questions = this.questions();
    return (
      questions.length > 0 &&
      questions.every((question) => (this.answers().get(question.id)?.length ?? 0) > 0)
    );
  }

  /** Persists the current selections and marks this browser as completed. */
  async completeSurvey() {
    const surveyId = this.route.snapshot.paramMap.get('id')!;
    if (
      !surveyId ||
      this.isSubmittingSurvey ||
      this.userHasVoted ||
      !this.hasAnsweredEveryQuestion()
    )
      return;

    this.isSubmittingSurvey = true;
    const wasPersisted = await this.persistAnswers();
    this.isSubmittingSurvey = false;
    if (!wasPersisted) return;

    localStorage.setItem(`survey_voted_${surveyId}`, 'true');
    this.userHasVoted = true;
    this.answers.set(new Map<string, string[]>());
    await this.questionService.getQuestionsForSurvey(surveyId);
    this.isSurveySubmitted = true;
  }

  /** Sends every non-empty local answer to the vote service.
   * @returns Whether all local answers were persisted.
   */
  private async persistAnswers(): Promise<boolean> {
    for (const [questionId, letters] of this.answers().entries()) {
      if (letters.length > 0) {
        const wasPersisted = await this.voteService.voteForOptions(questionId, letters);
        if (!wasPersisted) return false;
      }
    }
    return true;
  }

  /** Closes the submission feedback overlay. */
  closeSubmissionOverlay() {
    this.isSurveySubmitted = false;
  }

  /** Stores a changed question selection in local state. */
  onSelectionChanged(event: { questionId: string; optionIds: string[] }) {
    this.answers.update((answers) => {
      const updatedAnswers = new Map(answers);
      updatedAnswers.set(event.questionId, event.optionIds);
      return updatedAnswers;
    });
  }

  /** Opens the create-survey modal. */
  openCreateSurveyModal() {
    this.isCreateSurveyOpen = true;
  }
}
