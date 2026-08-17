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

  showErrorMsg() {
    const control = this.getQuestionControl();
    this.isVisible = !control?.value?.trim();
  }

  resetSurveyQuestionErr() {
    this.isVisible = false;
    this.createOptionComponent.resetSurveyOptionErr();
  }

  showAllErrors() {
    const control = this.getQuestionControl();
    this.isVisible = !control.value?.trim();

    this.createOptionComponent.showAllErrors();
  }

  getTextControl() {
    return this.questionGroup().get('text');
  }

  get multipleAnswerControl() {
    return this.questionGroup().get('allow_multiple');
  }

  getQuestionControl() {
    return this.questionGroup().get('text');
  }
}
