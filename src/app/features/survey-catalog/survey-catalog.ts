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

  /** Reloads the survey catalog when the component initializes. */
  ngOnInit() {
    this.surveyService.getAllSurveys();
  }

  /** Filters surveys by their selected status and current date.
   * @param list The surveys to filter.
   * @returns The surveys matching the active filter.
   */
  private filterSurveys(list: Survey[]) {
    const today = this.normalize(new Date());
    return list.filter((survey) => this.matchesFilter(survey, today));
  }

  /** Checks whether one survey belongs to the active catalog filter.
   * @param survey The survey to check.
   * @param today The normalized current date.
   * @returns Whether the survey matches the active filter.
   */
  private matchesFilter(survey: Survey, today: Date): boolean {
    const end = survey.end_date ? new Date(survey.end_date) : null;
    switch (this.filter()) {
      case 'ending-soon':
        return !!end && end >= today;
      case 'active':
        return !end || end >= today;
      case 'past':
        return !!end && end < today;
      default:
        return true;
    }
  }

  /** Sorts surveys according to the selected ordering.
   * @param list The surveys to sort.
   * @returns The sorted surveys.
   */
  private sortSurveys(list: Survey[]) {
    if (this.sort() === 'soonest-first') {
      return list.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
    }
    return list;
  }

  /** Applies the configured survey limit.
   * @param list The surveys to limit.
   * @returns The limited survey list.
   */
  private limitSurveys(list: Survey[]) {
    return this.limit ? list.slice(0, this.limit()) : list;
  }

  /** Normalizes a date to the start of its calendar day.
   * @param date The date to normalize.
   * @returns The normalized date.
   */
  private normalize(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /** Filters surveys by the selected category.
   * @param list The surveys to filter.
   * @returns The surveys matching the selected category.
   */
  private filterByCategory(list: Survey[]) {
    const category = this.category();
    if (!category || category === 'All surveys') {
      return list;
    }
    return list.filter((s) => s.category === category);
  }

  /** Returns the catalog surveys after all configured filters.
   * @returns The filtered, sorted, and limited surveys.
   */
  getfilteredSurveys() {
    let list = [...this.surveyList()];
    list = this.filterSurveys(list);
    list = this.filterByCategory(list);
    list = this.sortSurveys(list);
    list = this.limitSurveys(list);
    return list;
  }

  /** Returns a human-readable status for a survey end date.
   * @param serverDate The survey end date.
   * @returns The human-readable end-date status.
   */
  calculateRemainingDays(serverDate: string) {
    if (!serverDate) {
      return 'No end date.';
    }
    const days = this.remainingDays(serverDate);
    return days < 0 ? 'Survey expired' : days === 0 ? 'Ends today' : `Ends in ${days} days.`;
  }

  /** Calculates the rounded number of days until a survey ends.
   * @param serverDate The survey end date.
   * @returns The number of days remaining.
   */
  private remainingDays(serverDate: string): number {
    const difference = new Date(serverDate).getTime() - Date.now();
    return Math.ceil(difference / 86400000);
  }
}
