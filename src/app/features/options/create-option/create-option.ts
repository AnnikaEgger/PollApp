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

  /** Returns the text control for an option.
   * @param o The option form control.
   * @returns The option text form control.
   */
  getTextControl(o: AbstractControl) {
    return o.get('text') as FormControl;
  }

  /** Converts an option index to its display letter.
   * @param i The zero-based option index.
   * @returns The option's display letter.
   */
  getLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  /** Updates one option's validation state.
   * @param index The option index to validate.
   */
  showErrorMsg(index: number) {
    const control = this.options()?.controls[index].get('text');
    this.optionErrors[index] = !control?.value?.trim();
  }

  /** Truncates pasted option text to the configured maximum length.
   * @param index The option index to truncate.
   */
  trimOptionToMaxLength(index: number) {
    const control = this.options()?.controls[index].get('text');
    const value = control?.value;
    if (control && typeof value === 'string' && value.length > 100) {
      control.setValue(value.slice(0, 100));
    }
  }

  /** Adds a new option and its initial validation state. */
  onAddOption() {
    this.addOption.emit(this.questionIndex()!);
    this.optionErrors.push(true);
  }

  /** Removes an option and its validation state.
   * @param i The option index to remove.
   */
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
