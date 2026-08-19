import { Component, input, output, ViewChild } from '@angular/core';
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

  /** Returns the question text control. */
  getTextControl() {
    return this.questionGroup().get('text');
  }

  /** Returns the multiple-answer control. */
  get multipleAnswerControl() {
    return this.questionGroup().get('multiple_answers_allowed');
  }

  /** Returns the question text control for validation. */
  getQuestionControl() {
    return this.questionGroup().get('text');
  }
}
