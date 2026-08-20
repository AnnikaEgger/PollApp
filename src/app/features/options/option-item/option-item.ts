import { Component, inject, input, output, signal } from '@angular/core';
import { Option } from '../../../core/interfaces/option.interface';
import { VoteService } from '../../../core/services/vote.service';
import { supabase } from '../../../core/services/supabase.client';

@Component({
  selector: 'app-option-item',
  imports: [],
  templateUrl: './option-item.html',
  styleUrl: './option-item.scss',
})
export class OptionItem {
  option = input.required<Option>();
  isPastSurvey = input<boolean>(false);
  isDisabled = input<boolean>(false);
  voteService = inject(VoteService);
  isChecked = input<boolean>(false);
  clicked = output<string>();

  /** Emits a selected option unless the survey is disabled.
   * @param optionId The selected option identifier.
   */
  submitVote(optionId: string) {
    if (this.isDisabled() || this.isPastSurvey()) return;
    this.clicked.emit(optionId);
  }

  /** Legacy direct vote handler retained for option-level integrations.
   * @param questionId The question identifier.
   * @param letter The selected option letter.
   */
  async onOptionClicked(questionId: string, letter: string) {
    try {
      const { data: currentData, error: fetchError } = await this.fetchOptions(questionId);
      if (!currentData || fetchError)
        return console.error('Fehler beim Laden der Optionen:', fetchError);
      await this.saveOptionVote(questionId, currentData.options ?? [], letter);
    } catch (err) {
      console.error('Unerwarteter Fehler bei onOptionClicked:', err);
    }
  }

  /** Applies and persists one direct option vote.
   * @param questionId The question identifier.
   * @param options The current question options.
   * @param letter The selected option letter.
   */
  private async saveOptionVote(questionId: string, options: Option[], letter: string) {
    const { error } = await this.persistOptions(questionId, this.addVote(options, letter));
    if (error) return console.error('Fehler beim Speichern der Stimme:', error);
    console.log(`Stimme für Frage ${questionId}, Option ${letter} erfolgreich gespeichert!`);
  }

  /** Fetches the current options for a question.
   * @param questionId The question identifier.
   * @returns The Supabase query for the question options.
   */
  private fetchOptions(questionId: string) {
    return supabase.from('questions').select('options').eq('id', questionId).single();
  }

  /** Persists updated options for a question.
   * @param questionId The question identifier.
   * @param options The updated options.
   * @returns The Supabase update query.
   */
  private persistOptions(questionId: string, options: Option[]) {
    return supabase.from('questions').update({ options }).eq('id', questionId);
  }

  /** Adds one vote to the selected option.
   * @param options The options to update.
   * @param letter The selected option letter.
   * @returns The options with the selected vote added.
   */
  private addVote(options: Option[], letter: string): Option[] {
    return options.map((option) =>
      option.letter === letter ? { ...option, vote_count: (option.vote_count ?? 0) + 1 } : option,
    );
  }
}
