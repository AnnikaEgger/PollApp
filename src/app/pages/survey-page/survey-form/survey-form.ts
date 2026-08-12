import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormArray,
  ValidationErrors,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { SurveyService } from '../../../shared/services/survey';

@Component({
  selector: 'app-survey-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-form.html',
  styleUrl: './survey-form.scss',
})
export class SurveyForm {
  service = inject(SurveyService);
  survey = this.service.currentSurvey;

  constructor() {
    effect(() => {
      const currentQuestions = this.questions;
      if (currentQuestions && currentQuestions.length > 0) {
        this.initForm(currentQuestions);
      }
    });
  }

  minSelectedCheckboxes(min = 1) {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      const selectedCount = formArray.controls.filter((c) => c.value === true).length;
      return selectedCount >= min ? null : { required: true };
    };
  }

  get questions() {
    return this.service.currentQuestions();
  }

  surveyForm!: FormGroup;

  getCheckboxControl(questionIndex: number, answerIndex: number): FormControl {
    const control = this.questionsFormArray.at(questionIndex).get('answerSelection');

    if (control instanceof FormArray) {
      return control.at(answerIndex) as FormControl;
    }

    throw new Error(`Frage an Index ${questionIndex} ist kein Multiple-Choice-Feld!`);
  }

  private initForm(questionList: any[]): void {
    this.surveyForm = new FormGroup({
      questions: new FormArray(
        this.questions.map((question) => {
          if (question.allowMultipleAnswers) {
            const answersArray = new FormArray(
              question.answers.map(() => new FormControl(false), this.minSelectedCheckboxes(1)),
            );
            return new FormGroup({
              answerSelection: answersArray,
            });
          } else {
            return new FormGroup({
              answerSelection: new FormControl('', Validators.required),
            });
          }
        }),
      ),
    });
  }

  get questionsFormArray(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  getAnswersFormArray(questionIndex: number): FormArray {
    return this.questionsFormArray.at(questionIndex).get('answerSelection') as FormArray;
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  onSubmitSurvey() {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }

    const formValues = this.surveyForm.value.questions;

    const updatedQuestions = this.questions.map((question, qIndex) => {
      const updatedAnswers = question.answers.map((answer: any) => ({ ...answer }));

      const controlValue = formValues[qIndex].answerSelection;

      if (question.allowMultipleAnswers) {
        controlValue.forEach((isChecked: boolean, aIndex: number) => {
          if (isChecked) {
            updatedAnswers[aIndex].vote_count = (updatedAnswers[aIndex].vote_vount || 0) + 1;
          }
        });
      } else {
        if (controlValue) {
          const targetAnswer = updatedAnswers.find((a: any) => a.text === controlValue);
          if (targetAnswer) {
            targetAnswer.vote_count = (targetAnswer.vote_count || 0) + 1;
          }
        }
      }

      return {
        ...question,
        answers: updatedAnswers,
      };
    });

    console.log('Daten für die Datenbank:', updatedQuestions);
    this.service.updateAnswers(updatedQuestions);

    this.questionsFormArray.controls.forEach((questionGroup) => {
      const answerSelection = questionGroup.get('answerSelection');

      if (answerSelection instanceof FormArray) {
        answerSelection.controls.forEach((control) => control.setValue(false));
      } else if (answerSelection instanceof FormControl) {
        answerSelection.setValue('');
      }
    });

    this.surveyForm.markAsPristine();
    this.surveyForm.markAsUntouched();
  }

  getRadioControl(questionIndex: number): FormControl {
    return this.questionsFormArray.at(questionIndex).get('answerSelection') as FormControl;
  }
}
