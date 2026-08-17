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

  toggleDropdown() {
    this.isCategoriesOpen = !this.isCategoriesOpen;
  }

  onTriggerClick(event: MouseEvent) {
    event.stopPropagation();
    this.toggleDropdown();
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = this.dropdownRef()?.nativeElement.contains(target);
    if (!clickedInside) {
      this.isCategoriesOpen = false;
    }
  }

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
