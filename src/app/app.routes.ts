import { Routes } from '@angular/router';
import { SurveyPage } from './pages/survey-page/survey-page';
import { LandingPage } from './pages/landing-page/landing-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'survey/:id', component: SurveyPage },
];
