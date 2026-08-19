import { Component, input, output } from '@angular/core';
import { FormArray, ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import { DeleteButton } from '../../../shared/components/delete-button/delete-button';

@Component({
  selector: 'app-create-option',
  imports: [DeleteButton, ReactiveFormsModule],
  templateUrl: './create-option.html',
  styleUrl: './create-option.scss',
})
export class CreateOption {
  isVisible: boolean = false;
  questionIndex = input<number>();
  addOption = output<number>();
  options = input<FormArray>();
  deleteOption = output<number>();
  optionErrors: boolean[] = [];

  /** Returns the text control for an option. */
  getTextControl(o: AbstractControl) {
    return o.get('text') as FormControl;
  }

  /** Converts an option index to its display letter. */
  getLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  /** Updates one option's validation state. */
  showErrorMsg(index: number) {
    const control = this.options()?.controls[index].get('text');
    this.optionErrors[index] = !control?.value?.trim();
  }

  /** Adds a new option and its initial validation state. */
  onAddOption() {
    this.addOption.emit(this.questionIndex()!);
    this.optionErrors.push(true);
  }

  /** Removes an option and its validation state. */
  onDeleteOption(i: number) {
    this.deleteOption.emit(i);
    this.optionErrors.splice(i, 1);
  }

  /** Displays validation states for every option. */
  showAllErrors() {
    this.optionErrors =
      this.options()?.controls.map((c) => {
        return !c.get('text')?.value?.trim();
      }) || [];
  }

  /** Clears all option validation states. */
  resetSurveyOptionErr() {
    this.optionErrors = [];
  }
}
