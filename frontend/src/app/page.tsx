async function getBackendHealth() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/api/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getBackendHealth();

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 640,
        margin: '4rem auto',
        padding: '0 1rem',
      }}
    >
      <h1>FolcLib</h1>
      <p>Stack: Next.js + NestJS + Supabase (Docker)</p>

      <h2>Status do backend</h2>
      {health ? (
        <pre
          style={{
            background: '#f4f4f5',
            padding: '1rem',
            borderRadius: 8,
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        <p style={{ color: '#b91c1c' }}>
          Backend indisponivel. Verifique se o servico <code>backend</code> esta
          rodando.
        </p>
      )}
    </main>
  );
}
