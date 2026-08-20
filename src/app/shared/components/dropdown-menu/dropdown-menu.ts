import { Component, ElementRef, HostListener, input, output, viewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown-menu.html',
  styleUrl: './dropdown-menu.scss',
})
export class DropdownMenu {
  label = input<string>('');
  options = input<string[]>([]);
  value = input<string | null>(null);
  valueChange = output<string>();
  dropdownRef = viewChild<ElementRef>('dropdownRef');
  isCategoriesOpen = false;
  control = input<FormControl>();

  /** Toggles the category dropdown visibility. */
  toggleDropdown() {
    this.isCategoriesOpen = !this.isCategoriesOpen;
  }

  /** Stops propagation and toggles the dropdown from its trigger.
   * @param event The trigger click event.
   */
  onTriggerClick(event: MouseEvent) {
    event.stopPropagation();
    this.toggleDropdown();
  }

  @HostListener('document:click', ['$event'])
  /** Closes the dropdown when a click occurs outside it.
   * @param event The document click event.
   */
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = this.dropdownRef()?.nativeElement.contains(target);
    if (!clickedInside) {
      this.isCategoriesOpen = false;
    }
  }

  /** Selects a category and updates its form control.
   * @param option The selected category.
   */
  select(option: string) {
    this.valueChange.emit(option);
    const control = this.control();
    if (control) {
      control.setValue(option);
      control.markAsDirty();
      control.markAsTouched();
    }
    this.isCategoriesOpen = false;
  }
}
