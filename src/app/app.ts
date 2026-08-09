import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SurveyService } from './shared/services/survey';
import { SurveyWrapper } from './pages/survey-page/survey-wrapper/survey-wrapper';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SurveyWrapper],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('pollapp');

  service = inject(SurveyService);
}

// End date
// title
// description
// 4 questions, 3-5 options each, more options possible boolean, belongs to which survey?
//
