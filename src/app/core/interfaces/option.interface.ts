/**
 * A possible answer for a question.
 * Users pick one (or more) of these when voting.
 *
 * @property id - The option's unique ID.
 * @property created_at - When the option was created.
 * @property question_id - The ID of the question this option belongs to.
 * @property text - The text shown to users for this option.
 * @property order_index - The position of the option under the question.
 */

export interface Option {
  id: string;
  created_at: string;
  question_id: string;
  text: string;
  letter: string;
}
