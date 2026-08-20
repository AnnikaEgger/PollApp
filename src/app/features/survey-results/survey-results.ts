import { Component, input } from '@angular/core';
import { PercentagePipe } from '../../shared/pipes/percentage-pipe';
import { Question } from '../../core/interfaces/question.interface';
import { Option } from '../../core/interfaces/option.interface';

@Component({
  selector: 'app-survey-results',
  imports: [PercentagePipe],
  standalone: true,
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  options = input.required<Option[]>();
  question = input<Question | null>(null);

  /** Returns the total vote count for the displayed options.
   * @returns The total number of votes.
   */
  getTotalVotes(): number {
    return this.options().reduce((sum, opt) => sum + (opt.vote_count ?? 0), 0);
  }

  /** Converts one option's vote count into a percentage.
   * @param option The option to calculate.
   * @returns The option's vote percentage.
   */
  computeVotesToPercentages(option: Option): number {
    const totalVotes = this.getTotalVotes();
    if (totalVotes === 0) {
      return 0;
    }
    return ((option.vote_count ?? 0) / totalVotes) * 100;
  }
}
