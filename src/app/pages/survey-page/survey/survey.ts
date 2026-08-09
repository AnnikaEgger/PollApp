import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../core/services/survey';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-survey',
  imports: [DatePipe],
  templateUrl: './survey.html',
  styleUrl: './survey.scss',
})
export class Survey {
  service = inject(SurveyService);
  survey = this.service.currentSurvey;
  questions = this.service.currentQuestions;

  constructor() {}
}
