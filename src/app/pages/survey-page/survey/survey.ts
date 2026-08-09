import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../shared/services/survey';
import { DatePipe } from '@angular/common';
import { SurveyQuestion } from '../survey-question/survey-question';

@Component({
  selector: 'app-survey',
  imports: [DatePipe, SurveyQuestion],
  templateUrl: './survey.html',
  styleUrl: './survey.scss',
})
export class Survey {
  service = inject(SurveyService);
  survey = this.service.currentSurvey;
  questions = this.service.currentQuestions;

  getLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  constructor() {}
}
