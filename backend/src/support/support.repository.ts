import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ErrorReportRow, FaqRow } from './entities/support.entity';

@Injectable()
export class SupportRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  /** NF02 — lista de FAQ ordenada. */
  async listFaq(): Promise<FaqRow[]> {
    const { data, error } = await this.db
      .from('faq')
      .select('*')
      .order('ordem', { ascending: true });
    if (error) throw error;
    return (data ?? []) as FaqRow[];
  }

  /** NF04 — registra um relato de erro. */
  async insertErrorReport(values: {
    userId: string | null;
    descricao: string;
    url?: string;
  }): Promise<ErrorReportRow> {
    const { data, error } = await this.db
      .from('error_reports')
      .insert({
        user_id: values.userId,
        descricao: values.descricao,
        url: values.url ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as ErrorReportRow;
  }
}
