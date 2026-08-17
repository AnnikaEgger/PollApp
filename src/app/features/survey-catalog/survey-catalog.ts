import { Component, inject, input } from '@angular/core';
import { SurveyService } from '../../core/services/survey.service';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Survey } from '../../core/interfaces/survey.interface';

@Component({
  selector: 'app-survey-catalog',
  imports: [RouterLink, NgClass],
  templateUrl: './survey-catalog.html',
  styleUrl: './survey-catalog.scss',
})
export class SurveyCatalog {
  surveyService = inject(SurveyService);
  surveyList = this.surveyService.surveys;
  filter = input<string | undefined>();
  limit = input<number | undefined>();
  sort = input<string | undefined>();
  secondaryStyle = input(false);
  category = input<string | null>();

  ngOnInit() {
    this.surveyService.getAllSurveys();
  }

  private filterSurveys(list: Survey[]) {
    const today = this.normalize(new Date());
    return list.filter((s) => {
      const hasEndDate = !!s.end_date;
      const end = hasEndDate ? new Date(s.end_date) : null;

      switch (this.filter()) {
        case 'ending-soon':
          return hasEndDate && end! >= today;

        case 'active':
          return !hasEndDate || end! >= today;

        case 'past':
          return hasEndDate && end! < today;

        default:
          return true;
      }
    });
  }

  private sortSurveys(list: Survey[]) {
    if (this.sort() === 'soonest-first') {
      return list.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
    }
    return list;
  }

  private limitSurveys(list: Survey[]) {
    return this.limit ? list.slice(0, this.limit()) : list;
  }

  private normalize(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private filterByCategory(list: Survey[]) {
    const category = this.category();
    if (!category || category === 'All surveys') {
      return list;
    }
    return list.filter((s) => s.category === category);
  }

  getfilteredSurveys() {
    let list = [...this.surveyList()];
    list = this.filterSurveys(list);
    list = this.filterByCategory(list);
    list = this.sortSurveys(list);
    list = this.limitSurveys(list);
    return list;
  }

  calculateRemainingDays(serverDate: string) {
    if (!serverDate) {
      return 'No end date.';
    }
    const surveyDate = new Date(serverDate);
    const today = new Date();
    const remainingDays = (surveyDate.getTime() - today.getTime()) / 86400000;
    const roundUpDays = Math.ceil(remainingDays);
    if (roundUpDays < 0) {
      return 'Survey expired';
    }
    if (roundUpDays === 0) {
      return 'Ends today';
    } else {
      return `Ends in ${roundUpDays} days.`;
    }
  }
}
