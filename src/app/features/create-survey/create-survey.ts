import { Component, output, input } from '@angular/core';
import { SURVEY_CATEGORIES } from '../../shared/constants/survey-categories';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DeleteButton } from '../../shared/components/delete-button/delete-button';
import { DropdownMenu } from '../../shared/components/dropdown-menu/dropdown-menu';

@Component({
  selector: 'app-create-survey',
  imports: [ReactiveFormsModule, DeleteButton, DropdownMenu],
  templateUrl: './create-survey.html',
  styleUrl: './create-survey.scss',
})
export class CreateSurvey {
  categories = SURVEY_CATEGORIES;
  selectedCategory: string | null = null;
  isVisible: boolean = false;
  categoryErrorVisible: boolean = false;
  today = new Date().toISOString().split('T')[0];
  categoryControl = input<FormControl>();
  clearSurveyName = output<void>();
  titleControl = input.required<FormControl>();
  clearSurveyDatum = output<void>();
  datumControl = input.required<FormControl>();
  clearSurveyDesctiption = output<void>();
  descriptionControl = input.required<FormControl>();

  /** Displays the survey-name validation state. */
  showErrorMsg() {
    const control = this.titleControl();
    this.isVisible = !control?.value?.trim();
  }

  /** Clears the survey-name validation state. */
  resetSurveyNameErr() {
    this.isVisible = false;
  }

  /** Resets the selected category and its validation state. */
  resetCategory() {
    this.selectedCategory = '';
    this.categoryErrorVisible = false;
  }

  /** Updates the selected category and clears its error state. */
  onCategorySelected(value: string | null) {
    this.selectedCategory = value;
    if (value) {
      this.categoryErrorVisible = false;
    }
  }

  /** Displays all validation messages for the survey header. */
  showAllErrors() {
    const title = this.titleControl();
    const category = this.categoryControl();
    this.isVisible = !title?.value?.trim();
    this.categoryErrorVisible = !category?.value?.trim();
  }
}
