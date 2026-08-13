import { Component, inject, input, output } from '@angular/core';
import { SurveyService } from '../../../core/services/survey.service';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from '../../../core/services/question.service';
import { QuestionItem } from '../../questions/question-item/question-item';

@Component({
  selector: 'app-survey-sheet',
  imports: [QuestionItem],
  templateUrl: './survey-sheet.html',
  styleUrl: './survey-sheet.scss',
})
export class SurveySheet {
  surveyService = inject(SurveyService);
  questionService = inject(QuestionService);
  surveyDetails = this.surveyService.singleSurvey;
  surveyQuestions = this.questionService.questions;
  private route = inject(ActivatedRoute);
  isPastSurvey = input<boolean>(false);
  selectionChanged = output<{ questionId: string; optionIds: string[] }>();

  ngOnInit() {
    let currentId = String(this.route.snapshot.paramMap.get('id'));
    currentId = '5';

    if (currentId) {
      this.surveyService.getSingleSurvey(currentId);
      this.questionService.getQuestionsForSurvey(currentId);
    }
  }

  getPublishLabel(): string {
    return this.surveyDetails()?.published ? 'Published' : 'Draft';
  }

  formatEndDate() {
    const serverDate = this.surveyDetails()?.end_date;
    if (!serverDate) {
      return null;
    }
    const date = new Date(serverDate);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
