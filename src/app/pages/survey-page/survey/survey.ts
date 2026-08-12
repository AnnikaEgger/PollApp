import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../shared/services/survey';
import { DatePipe } from '@angular/common';
import { SurveyQuestion } from '../survey-question/survey-question';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { SurveyForm } from '../survey-form/survey-form';

@Component({
  selector: 'app-survey',
  imports: [DatePipe, SurveyQuestion, SurveyForm],
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

  // quizForm: FormGroup

  constructor() {}

  completeSurvey() {
    const questions = this.service.currentQuestions();

    questions.forEach((question) => {});
    let quizForm = new FormGroup({
      // questionId: new FormControl(this.question.id),
      // FormArray für die Antworten
      answers: new FormArray(questions.map((a) => new FormControl())),
    });
  }
}
