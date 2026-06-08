import { ContentView } from '@/features/content';

export default function ConteudoPage({ params }: { params: { id: string } }) {
  return (
    <main className="container page" style={{ maxWidth: 760 }}>
      <ContentView id={params.id} />
    </main>
  );
}
