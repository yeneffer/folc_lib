import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;
  private authClient: SupabaseClient;

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

    const opts = { auth: { persistSession: false, autoRefreshToken: false } };
    // Client principal: admin + queries (service_role, BYPASSRLS).
    this.client = createClient(url, key, opts);
    // Client SEPARADO p/ login/refresh: signInWithPassword grava a sessao do
    // usuario no client, o que rebaixaria o role das queries seguintes. Manter
    // isolado preserva o client principal sempre como service_role.
    this.authClient = createClient(url, key, opts);
  }

  /** Cliente service_role (admin + DB). Nunca fazer signIn aqui. */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Cliente Supabase nao inicializado. Verifique o .env.');
    }
    return this.client;
  }

  /** Cliente isolado para login/refresh de usuario (nao usar para DB). */
  getAuthClient(): SupabaseClient {
    if (!this.authClient) {
      throw new Error('Cliente Supabase nao inicializado. Verifique o .env.');
    }
    return this.authClient;
  }
}
