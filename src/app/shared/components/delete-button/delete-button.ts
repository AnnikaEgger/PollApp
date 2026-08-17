import { Component, output } from '@angular/core';

@Component({
  selector: 'app-delete-btn',
  imports: [],
  templateUrl: './delete-button.html',
  styleUrl: './delete-button.scss',
})
export class DeleteButton {
  delete = output<void>();
}
