import { Badge } from "@/components/ui/badge";

type GamePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-6 text-[#171717] sm:px-8 lg:px-10">
      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(320px,680px)_minmax(280px,360px)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#766246]">
            Game {id}
          </p>
          <div className="mt-5 grid aspect-square max-h-[680px] w-full place-items-center border border-[#987d54] bg-[#ede4d4]">
            <p className="text-sm font-semibold text-[#5d5548]">
              ChessboardView placeholder
            </p>
          </div>
        </div>

        <aside className="border-l border-[#d9d0c0] pl-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">Game shell</h1>
            <Badge variant="secondary">Phase 01</Badge>
          </div>
          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-semibold text-[#766246]">Status</dt>
              <dd className="mt-1 text-[#25211c]">Waiting for GameService</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#766246]">Side to move</dt>
              <dd className="mt-1 text-[#25211c]">White</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#766246]">Moves</dt>
              <dd className="mt-1 text-[#25211c]">
                SAN list lands after persistence.
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
