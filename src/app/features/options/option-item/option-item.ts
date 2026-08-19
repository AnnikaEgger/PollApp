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

  submitVote(optionId: string) {
    if (this.isDisabled() || this.isPastSurvey()) return;
    this.clicked.emit(optionId);
  }

  async onOptionClicked(questionId: string, letter: string) {
    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('questions')
        .select('options')
        .eq('id', questionId)
        .single();

      if (fetchError || !currentData) {
        console.error('Fehler beim Laden der Optionen:', fetchError);
        return;
      }

      const options: Option[] = currentData.options ?? [];

      const updatedOptions = options.map((opt) => {
        if (opt.letter === letter) {
          return {
            ...opt,
            vote_count: (opt.vote_count ?? 0) + 1,
          };
        }
        return opt;
      });

      const { error: updateError } = await supabase
        .from('questions')
        .update({ options: updatedOptions })
        .eq('id', questionId);

      if (updateError) {
        console.error('Fehler beim Speichern der Stimme:', updateError);
        return;
      }

      console.log(`Stimme für Frage ${questionId}, Option ${letter} erfolgreich gespeichert!`);
    } catch (err) {
      console.error('Unerwarteter Fehler bei onOptionClicked:', err);
    }
  }
}
