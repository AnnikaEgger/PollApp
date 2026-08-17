import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../core/services/survey.service';

@Component({
  selector: 'app-create-survey-btn',
  imports: [],
  templateUrl: './create-survey-btn.html',
  styleUrl: './create-survey-btn.scss',
})
export class CreateSurveyBtn {
  surveyService = inject(SurveyService);
}
