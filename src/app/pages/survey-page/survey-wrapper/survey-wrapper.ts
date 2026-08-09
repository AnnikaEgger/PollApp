import { Component } from '@angular/core';
import { Survey } from '../survey/survey';
import { SurveyResults } from '../survey-results/survey-results';

@Component({
  selector: 'app-survey-wrapper',
  imports: [Survey, SurveyResults],
  templateUrl: './survey-wrapper.html',
  styleUrl: './survey-wrapper.scss',
})
export class SurveyWrapper {}
