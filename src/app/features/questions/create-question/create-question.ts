import { Component, input, output, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { DeleteButton } from '../../../shared/components/delete-button/delete-button';
import { CreateOption } from '../../options/create-option/create-option';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-question',
  imports: [DeleteButton, CreateOption, ReactiveFormsModule],
  templateUrl: './create-question.html',
  styleUrl: './create-question.scss',
})
export class CreateQuestion {
  isVisible: boolean = false;
  questionIndex = input<number>();
  questionGroup = input<any>();
  addOption = output<void>();
  deleteOption = output<number>();
  deleteQuestion = output<void>();
  @ViewChild('createOption') createOptionComponent!: CreateOption;

  /** Displays the question validation state. */
  showErrorMsg() {
    const control = this.getQuestionControl();
    this.isVisible = !control?.value?.trim();
  }

  /** Truncates pasted question text to the configured maximum length. */
  trimQuestionToMaxLength() {
    const control = this.getQuestionControl() as AbstractControl;
    const value = control.value;
    if (typeof value === 'string' && value.length > 100) {
      control.setValue(value.slice(0, 100));
    }
  }

  /** Clears question and option validation states. */
  resetSurveyQuestionErr() {
    this.isVisible = false;
    this.createOptionComponent.resetSurveyOptionErr();
  }

  /** Displays validation states for the question and its options. */
  showAllErrors() {
    const control = this.getQuestionControl();
    this.isVisible = !control.value?.trim();

    this.createOptionComponent.showAllErrors();
  }

  /** Returns the question text control.
   * @returns The question text form control.
   */
  getTextControl() {
    return this.questionGroup().get('text');
  }

  /** Returns the multiple-answer control.
   * @returns The multiple-answer form control.
   */
  get multipleAnswerControl() {
    return this.questionGroup().get('multiple_answers_allowed');
  }

  /** Returns the question text control for validation.
   * @returns The question text form control.
   */
  getQuestionControl() {
    return this.questionGroup().get('text');
  }
}
