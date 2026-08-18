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

  ngOnInit() {
    document.body.setAttribute('data-page', 'landing');
  }

  ngOnDestroy() {
    document.body.removeAttribute('data-page');
  }

  openCreateSurveyModal() {
    this.isCreateSurveyOpen = true;
  }
}
