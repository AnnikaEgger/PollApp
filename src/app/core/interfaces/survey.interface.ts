/**
 * Basic info about a survey.
 * This is what we show in the survey list and on the details page.
 *
 * @property id - The survey's unique ID.
 * @property created_at - When the survey was created.
 * @property title - The main title shown to users.
 * @property description - A short explanation of what the survey is about.
 * @property category - Used to group or filter surveys.
 * @property end_date - The date when the survey stops accepting votes.
 * @property is_published - If true, the survey is visible to users.
 */
export interface Survey {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  end_date: string;
  published: boolean;
}
