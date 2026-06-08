import { Injectable } from '@nestjs/common';
import { ContributionStatus } from '../common/enums';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { ContributionFile, ContributionRow } from './entities/contribution.entity';

@Injectable()
export class ContributionsRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  async insert(values: {
    colaboradorId: string | null;
    titulo: string;
    descricao: string;
    arquivos: ContributionFile[];
    nomeContato?: string;
    emailContato?: string;
  }): Promise<ContributionRow> {
    const { data, error } = await this.db
      .from('contributions')
      .insert({
        colaborador_id: values.colaboradorId,
        titulo: values.titulo,
        descricao: values.descricao,
        arquivos: values.arquivos,
        status: ContributionStatus.Recebida,
        nome_contato: values.nomeContato ?? null,
        email_contato: values.emailContato ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as ContributionRow;
  }

  async findById(id: string): Promise<ContributionRow | null> {
    const { data } = await this.db
      .from('contributions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return (data as ContributionRow) ?? null;
  }

  async listByColaborador(
    colaboradorId: string,
    query: PaginationQueryDto,
  ): Promise<{ rows: ContributionRow[]; total: number }> {
    const { data, count, error } = await this.db
      .from('contributions')
      .select('*', { count: 'exact' })
      .eq('colaborador_id', colaboradorId)
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);
    if (error) throw error;
    return { rows: (data ?? []) as ContributionRow[], total: count ?? 0 };
  }

  async listQueue(
    query: PaginationQueryDto,
  ): Promise<{ rows: ContributionRow[]; total: number }> {
    const { data, count, error } = await this.db
      .from('contributions')
      .select('*', { count: 'exact' })
      .in('status', [ContributionStatus.Recebida, ContributionStatus.EmAvaliacao])
      .order('created_at', { ascending: true })
      .range(query.offset, query.offset + query.limit - 1);
    if (error) throw error;
    return { rows: (data ?? []) as ContributionRow[], total: count ?? 0 };
  }

  async updateStatus(
    id: string,
    status: ContributionStatus,
  ): Promise<ContributionRow> {
    const { data, error } = await this.db
      .from('contributions')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as ContributionRow;
  }
}
