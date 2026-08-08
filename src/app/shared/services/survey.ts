import { Service } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../../environment';

@Service()
export class Survey {
  supabase = createClient(env.supabase_url, env.supabase_key);

  surveys: [] = [];

  categories: string[] = ['Technology & Future', 'Everyday Life', 'Society & Politics'];

  async insertSurvey() {
    const { data, error } = await this.supabase
      .from('surveys')
      .insert([{ some_column: 'someValue', other_column: 'otherValue' }])
      .select();
  }
}
