import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Supabase] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes. ' +
          'Defina no .env para habilitar o cliente.',
      );
      return;
    }

    this.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  /** Cliente Supabase com a service role key (uso somente no servidor). */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Cliente Supabase nao inicializado. Verifique o .env.');
    }
    return this.client;
  }
}
