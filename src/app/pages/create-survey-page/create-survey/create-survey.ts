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

  ngOnInit() {
    this.addQuestion();
  }

  get questionsArr() {
    return this.surveyForm.get('questions') as FormArray;
  }

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

  getOptionsArr(questionIndex: number) {
    return this.questionsArr.at(questionIndex).get('options') as FormArray;
  }

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

  private canSubmitSurvey(): boolean {
    if (this.surveyForm.valid) return true;
    this.surveyForm.markAllAsTouched();
    this.showAllCustomErrors();
    return false;
  }

  private normalizeSurveyPayload(value: any) {
    return {
      ...value,
      end_date: value.end_date || null,
      description: value.description || null,
    };
  }

  private async insertQuestions(questions: any[], surveyId: number) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      const questionPayload: QuestionInsert = {
        survey_id: surveyId.toString(),
        number: q.number ?? i + 1,
        text: q.text,
        multiple_answers_allowed: q.multiple_answers_allowed ?? q.multiple_answers_allowed ?? false,
        options: q.options.map((o: any, index: number) => ({
          letter: String.fromCharCode(65 + index),
          text: typeof o === 'string' ? o : o.text,
          vote_count: 0,
        })),
      };

      await this.questionService.insertQuestion(questionPayload);
    }
  }

  closePublishedOverlay() {
    this.isPublishedOverlayOpen = false;
    this.redirectToSurveyDetails(this.lastCreatedSurveyId!);
  }

  redirectToSurveyDetails(id: number) {
    this.router.navigate(['/survey', id]);
  }

  closeCreateSurveyModal() {
    this.surveyForm.reset();
    this.createSurveyComponent.resetSurveyNameErr();
    this.createSurveyComponent.resetCategory();
    this.questionComponents.forEach((cmp) => {
      cmp.resetSurveyQuestionErr();
    });
    this.close.emit();
  }

  showAllCustomErrors() {
    this.createSurveyComponent.showAllErrors();
    this.questionComponents.forEach((cmp) => {
      cmp.showAllErrors();
    });
  }

  getOptions(q: AbstractControl): FormArray {
    return q.get('options') as FormArray;
  }

  onClearSurveyDatum() {
    this.surveyForm.get('end_date')!.setValue('');
  }

  onClearSurveyName() {
    this.surveyForm.get('title')!.setValue('');
  }

  onClearSurveyDescription() {
    this.surveyForm.get('description')!.setValue('');
  }

  get titleControl(): FormControl {
    return this.surveyForm.get('title') as FormControl;
  }

  get datumControl(): FormControl {
    return this.surveyForm.get('end_date') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.surveyForm.get('description') as FormControl;
  }

  get categoryControl(): FormControl {
    return this.surveyForm.get('category') as FormControl;
  }
}
