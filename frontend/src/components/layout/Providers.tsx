'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';

/** Providers globais do app (client). */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
