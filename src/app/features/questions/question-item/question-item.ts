import { Component, inject, signal, input, output, OnInit, OnDestroy } from '@angular/core';
import { Question } from '../../../core/interfaces/question.interface';
import { OptionItem } from '../../options/option-item/option-item';
import { Option } from '../../../core/interfaces/option.interface';
import { supabase } from '../../../core/services/supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  selector: 'app-question-item',
  imports: [OptionItem],
  templateUrl: './question-item.html',
  styleUrl: './question-item.scss',
})
export class QuestionItem implements OnInit, OnDestroy {
  question = input.required<Question>();
  options = signal<Option[]>([]);
  private optionChannel: RealtimeChannel | null = null;
  isPastSurvey = input<boolean>(false);
  isDisabled = input<boolean>(false);

  selectedOptions = signal<string[]>([]);
  selectedChange = output<{ questionId: string; optionIds: string[] }>();

  /** Loads the initial options and starts realtime updates. */
  async ngOnInit() {
    this.loadOptionsFromQuestion();

    this.listenForOptionUpdates();
  }

  /** Stops the realtime option subscription. */
  ngOnDestroy() {
    this.stopListeningForOptionUpdates();
  }

  /** Maps the question's initial options into the local signal. */
  loadOptionsFromQuestion() {
    const rawOptions = this.question().options ?? [];
    const mappedOptions = rawOptions.map((opt: any, index: number) => ({
      ...opt,
      letter: String.fromCharCode(65 + index),
    }));
    this.options.set(mappedOptions);
  }

  /** Subscribes to realtime option changes for this question. */
  listenForOptionUpdates() {
    if (this.optionChannel) {
      this.stopListeningForOptionUpdates();
    }
    this.optionChannel = this.createOptionChannel();
  }

  /** Creates the realtime channel used by this question.
   * @returns The realtime option channel.
   */
  private createOptionChannel(): RealtimeChannel {
    return supabase
      .channel(`question-options-${this.question().id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `id=eq.${this.question().id}`,
        },
        (payload) => this.options.set(this.mapOptions((payload.new as any)?.options ?? [])),
      )
      .subscribe();
  }

  /** Maps realtime option data to stable lettered options.
   * @param rawOptions The raw option values.
   * @returns The lettered option values.
   */
  private mapOptions(rawOptions: any[]): Option[] {
    return rawOptions.map((option, index) => ({
      ...option,
      letter: String.fromCharCode(65 + index),
    }));
  }

  /** Unsubscribes from realtime option changes. */
  stopListeningForOptionUpdates() {
    if (this.optionChannel) {
      this.optionChannel.unsubscribe();
      this.optionChannel = null;
    }
  }

  /** Indicates whether multiple answers are allowed.
   * @returns Whether multiple answers are allowed.
   */
  isMultipleAllowed(): boolean {
    return this.question().multiple_answers_allowed === true;
  }

  /** Updates the local selection and emits it to the survey sheet.
   * @param letter The selected option letter.
   */
  onOptionClicked(letter: string) {
    if (this.isMultipleAllowed()) {
      this.selectedOptions.update((list) =>
        list.includes(letter) ? list.filter((l) => l !== letter) : [...list, letter],
      );
    } else {
      this.selectedOptions.set([letter]);
    }

    this.selectedChange.emit({
      questionId: this.question().id,
      optionIds: this.selectedOptions(),
    });
  }
}
