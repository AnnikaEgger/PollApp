import { Component, inject, output, ViewChild, ViewChildren, QueryList } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { SurveyService } from '../../../core/services/survey.service';
import { QuestionService } from '../../../core/services/question.service';
import { OptionService } from '../../../core/services/option.service';
import { Router } from '@angular/router';
import { CreateSurvey } from '../../../features/create-survey/create-survey';
import { CreateQuestion } from '../../../features/questions/create-question/create-question';
import { ChangeDetectorRef } from '@angular/core';
import { Question, QuestionInsert } from '../../../core/interfaces/question.interface';

@Component({
  selector: 'app-create-survey-page',
  imports: [ReactiveFormsModule, CreateSurvey, CreateQuestion],
  templateUrl: './create-survey.html',
  styleUrl: './create-survey.scss',
})
export class CreateSurveyPage {
  surveyService = inject(SurveyService);
  questionService = inject(QuestionService);
  optionService = inject(OptionService);
  router = inject(Router);
  close = output<void>();
  isPublishedOverlayOpen: boolean = false;
  isSubmittingSurvey: boolean = false;
  lastCreatedSurveyId: number | null = null;
  /** Creates the survey page with change detection support. */
  constructor(private cd: ChangeDetectorRef) {}
  @ViewChild('createSurvey') createSurveyComponent!: CreateSurvey;
  @ViewChildren(CreateQuestion) questionComponents!: QueryList<CreateQuestion>;

  surveyForm = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required],
    }),
    description: new FormControl(''),
    end_date: new FormControl(''),
    is_published: new FormControl(false),
    category: new FormControl('', {
      validators: [Validators.required],
    }),
    questions: new FormArray([]),
  });

  /** Adds the initial question to a new survey. */
  ngOnInit() {
    this.addQuestion();
  }

  /** Returns the survey question form array. */
  get questionsArr() {
    return this.surveyForm.get('questions') as FormArray;
  }

  /** Adds a question with two initial options. */
  addQuestion() {
    const question = new FormGroup({
      order_index: new FormControl(this.questionsArr.length + 1),
      text: new FormControl('', Validators.required),
      multiple_answers_allowed: new FormControl(false),
      options: new FormArray([]),
    });
    this.questionsArr.push(question);
    const questionIndex = this.questionsArr.length - 1;
    this.addOption(questionIndex);
    this.addOption(questionIndex);
  }

  /** Deletes a question or clears the only remaining question. */
  deleteQuestion(index: number) {
    if (this.questionsArr.length <= 1) {
      const question = this.questionsArr.at(index);
      question.get('text')?.setValue('');
      return;
    }
    this.questionsArr.removeAt(index);
    this.questionsArr.controls.forEach((q, i) => {
      q.get('order_index')?.setValue(i + 1);
    });
  }

  /** Returns the option form array for a question. */
  getOptionsArr(questionIndex: number) {
    return this.questionsArr.at(questionIndex).get('options') as FormArray;
  }

  /** Adds an option unless the maximum has been reached. */
  addOption(questionIndex: number) {
    const optionsArr = this.getOptionsArr(questionIndex);
    if (optionsArr.length >= 6) return;
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
    const option = new FormGroup({
      text: new FormControl('', Validators.required),
      order_index: new FormControl(alphabet[optionsArr.length]),
    });
    optionsArr.push(option);
  }

  /** Deletes an option or clears the final required options. */
  deleteOption(questionIndex: number, optionIndex: number) {
    const optionsArr = this.getOptionsArr(questionIndex);
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
    if (optionsArr.length <= 2) {
      const option = optionsArr.at(optionIndex);
      option.get('text')?.setValue('');
      return;
    }
    optionsArr.removeAt(optionIndex);
    optionsArr.controls.forEach((o, i) => {
      o.get('order_index')?.setValue(alphabet[i]);
    });
  }

  /** Validates and persists the complete survey. */
  async submitSurvey() {
    if (!this.canSubmitSurvey()) return;
    this.isSubmittingSurvey = true;
    const formValue = this.normalizeSurveyPayload(this.surveyForm.value);
    formValue.is_published = true;
    const survey = await this.surveyService.insertSurvey(formValue);
    await this.insertQuestions(formValue.questions, survey.id);
    this.lastCreatedSurveyId = survey.id;
    this.showOverlays();
  }

  /** Shows the publish overlay before redirecting to the survey. */
  private showOverlays() {
    setTimeout(() => {
      this.isSubmittingSurvey = false;
      this.isPublishedOverlayOpen = true;
      this.cd.detectChanges();
      setTimeout(() => {
        this.redirectToSurveyDetails(this.lastCreatedSurveyId!);
      }, 1000);
    }, 350);
  }

  /** Returns whether the survey form can be submitted. */
  private canSubmitSurvey(): boolean {
    if (this.surveyForm.valid) return true;
    this.surveyForm.markAllAsTouched();
    this.showAllCustomErrors();
    return false;
  }

  /** Normalizes optional survey values for persistence. */
  private normalizeSurveyPayload(value: any) {
    return {
      ...value,
      end_date: value.end_date || null,
      description: value.description || null,
    };
  }

  /** Inserts every question belonging to a newly created survey. */
  private async insertQuestions(questions: any[], surveyId: number) {
    for (let index = 0; index < questions.length; index++) {
      await this.questionService.insertQuestion(
        this.toQuestionPayload(questions[index], surveyId, index),
      );
    }
  }

  /** Converts a form question into the service insert shape. */
  private toQuestionPayload(question: any, surveyId: number, index: number): QuestionInsert {
    return {
      survey_id: surveyId.toString(),
      number: question.number ?? index + 1,
      text: question.text,
      multiple_answers_allowed: question.multiple_answers_allowed ?? false,
      options: question.options.map((option: any, optionIndex: number) => ({
        letter: String.fromCharCode(65 + optionIndex),
        text: typeof option === 'string' ? option : option.text,
        vote_count: 0,
      })),
    };
  }

  /** Closes the publish overlay and opens the created survey. */
  closePublishedOverlay() {
    this.isPublishedOverlayOpen = false;
    this.redirectToSurveyDetails(this.lastCreatedSurveyId!);
  }

  /** Navigates to a survey detail page. */
  redirectToSurveyDetails(id: number) {
    this.router.navigate(['/survey', id]);
  }

  /** Resets and closes the create-survey modal. */
  closeCreateSurveyModal() {
    this.surveyForm.reset();
    this.createSurveyComponent.resetSurveyNameErr();
    this.createSurveyComponent.resetCategory();
    this.questionComponents.forEach((cmp) => {
      cmp.resetSurveyQuestionErr();
    });
    this.close.emit();
  }

  /** Displays validation errors across all survey fields. */
  showAllCustomErrors() {
    this.createSurveyComponent.showAllErrors();
    this.questionComponents.forEach((cmp) => {
      cmp.showAllErrors();
    });
  }

  /** Returns the options form array from a question control. */
  getOptions(q: AbstractControl): FormArray {
    return q.get('options') as FormArray;
  }

  /** Clears the survey end-date control. */
  onClearSurveyDatum() {
    this.surveyForm.get('end_date')!.setValue('');
  }

  /** Clears the survey title control. */
  onClearSurveyName() {
    this.surveyForm.get('title')!.setValue('');
  }

  /** Clears the survey description control. */
  onClearSurveyDescription() {
    this.surveyForm.get('description')!.setValue('');
  }

  /** Returns the survey title control. */
  get titleControl(): FormControl {
    return this.surveyForm.get('title') as FormControl;
  }

  /** Returns the survey end-date control. */
  get datumControl(): FormControl {
    return this.surveyForm.get('end_date') as FormControl;
  }

  /** Returns the survey description control. */
  get descriptionControl(): FormControl {
    return this.surveyForm.get('description') as FormControl;
  }

  /** Returns the survey category control. */
  get categoryControl(): FormControl {
    return this.surveyForm.get('category') as FormControl;
  }
}
