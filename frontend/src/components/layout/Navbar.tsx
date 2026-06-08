'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand">
          FolcLib
        </Link>
        <nav>
          <Link href="/acervo">Acervo</Link>
          <Link href="/colaborar">Colaborar</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/sobre">Sobre</Link>

          {user?.role === 'professor' && <Link href="/turmas">Turmas</Link>}
          {user?.role === 'avaliador' && <Link href="/curadoria">Curadoria</Link>}

          {loading ? null : user ? (
            <div className="dropdown" ref={ref}>
              <button
                className="btn btn-secondary"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {user.nome.split(' ')[0]} ▾
              </button>
              {open && (
                <div className="dropdown-menu" role="menu">
                  <Link href="/perfil" onClick={() => setOpen(false)}>
                    Meu perfil
                  </Link>
                  <Link href="/me/offline" onClick={() => setOpen(false)}>
                    Salvos offline
                  </Link>
                  <button onClick={handleLogout}>Sair</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/cadastro" className="btn btn-primary">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
