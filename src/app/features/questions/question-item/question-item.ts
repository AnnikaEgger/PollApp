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

  selectedOptions = signal<string[]>([]);
  selectedChange = output<{ questionId: string; optionIds: string[] }>();

  async ngOnInit() {
    this.loadOptionsFromQuestion();

    this.listenForOptionUpdates();
  }

  ngOnDestroy() {
    this.stopListeningForOptionUpdates();
  }

  loadOptionsFromQuestion() {
    const rawOptions = this.question().options ?? [];
    const mappedOptions = rawOptions.map((opt: any, index: number) => ({
      ...opt,
      letter: opt.letter ?? String.fromCharCode(65 + index),
    }));
    this.options.set(mappedOptions);
  }

  listenForOptionUpdates() {
    if (this.optionChannel) {
      this.stopListeningForOptionUpdates();
    }

    this.optionChannel = supabase
      .channel(`question-options-${this.question().id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `id=eq.${this.question().id}`,
        },
        (payload) => {
          const updatedQuestion = payload.new as any;
          const rawOptions = updatedQuestion?.options ?? [];

          const mappedOptions = rawOptions.map((opt: any, index: number) => ({
            ...opt,
            letter: opt.letter ?? String.fromCharCode(65 + index),
          }));

          this.options.set(mappedOptions);
        },
      )
      .subscribe();
  }

  stopListeningForOptionUpdates() {
    if (this.optionChannel) {
      this.optionChannel.unsubscribe();
      this.optionChannel = null;
    }
  }

  isMultipleAllowed(): boolean {
    return this.question().multiple_answers_allowed === true;
  }

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
