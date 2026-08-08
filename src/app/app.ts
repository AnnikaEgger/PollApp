import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SurveyWrapper } from './components/survey-wrapper/survey-wrapper';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SurveyWrapper],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('pollapp');
}

// End date
// title
// description
// 4 questions, 3-5 options each, more options possible boolean, belongs to which survey?
//
