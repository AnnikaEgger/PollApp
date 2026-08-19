import { Component, ViewChild, ElementRef } from '@angular/core';
import { SURVEY_CATEGORIES } from '../../shared/constants/survey-categories';
import { CreateSurveyPage } from '../create-survey-page/create-survey/create-survey';
import { DropdownMenu } from '../../shared/components/dropdown-menu/dropdown-menu';
import { SurveyCatalog } from '../../features/survey-catalog/survey-catalog';
import { CreateSurveyBtn } from '../../shared/components/create-survey-btn/create-survey-btn';

@Component({
  selector: 'app-landing-page',
  imports: [SurveyCatalog, DropdownMenu, CreateSurveyPage, CreateSurveyBtn],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  activeFilter: 'active' | 'past' = 'active';
  categories = ['All surveys', ...SURVEY_CATEGORIES];
  selectedCategory: string | null = null;
  isCreateSurveyOpen = false;

  @ViewChild('createSurveyModal') modal!: ElementRef<HTMLDialogElement>;

  /** Loads the catalog and listens for modal close events. */
  ngOnInit() {
    document.body.setAttribute('data-page', 'landing');
  }

  /** Removes the modal close subscription. */
  ngOnDestroy() {
    document.body.removeAttribute('data-page');
  }

  /** Opens the create-survey modal. */
  openCreateSurveyModal() {
    this.isCreateSurveyOpen = true;
  }
}
