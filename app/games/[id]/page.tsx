import Link from "next/link";

import { AuthActions } from "@/components/auth/auth-actions";
import { GameScreen } from "@/components/game/game-screen";

type GamePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-6 text-[#171717] sm:px-8 lg:px-10">
      <header className="mx-auto mb-6 flex w-full max-w-7xl items-center justify-between gap-4">
        <Link href="/play" className="text-sm font-semibold text-[#766246]">
          Chess MVP
        </Link>
        <AuthActions />
      </header>
      <div className="mx-auto mb-4 w-full max-w-7xl">
        <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7a62]">
          Game {id}
        </p>
      </div>
      <div className="mx-auto w-full max-w-7xl">
        <GameScreen gameId={id} />
      </div>
    </main>
  );
}
