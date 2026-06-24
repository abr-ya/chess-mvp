import Link from "next/link";
import { AuthActions } from "@/components/auth/auth-actions";
import { buttonVariants } from "@/components/ui/button";

const featureRows = [
  ["Mode", "Manual chess game foundation"],
  ["Rules", "Server-authoritative validation planned through chess.js"],
  ["Storage", "Users, games, participants, moves, and positions"],
  ["Next slice", "Authentication shell, Prisma schema, and GameService"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#171717]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#d9d0c0] pb-4">
          <Link href="/" className="text-lg font-semibold">
            Chess MVP
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-[#5d5548]">
            <Link
              href="/play"
              prefetch={false}
              className="transition hover:text-[#171717]"
            >
              Play
            </Link>
            <Link
              href="/games/example"
              prefetch={false}
              className="transition hover:text-[#171717]"
            >
              Game
            </Link>
            <AuthActions />
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#766246]">
              Phase 01 scaffold
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[#171717] sm:text-5xl">
              Build the reliable chess game core first.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5d5548] sm:text-lg">
              This app starts at the product surface: create a basic game, route
              into the board, then grow the server-backed move model underneath.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/play"
                prefetch={false}
                className={buttonVariants({ size: "lg" })}
              >
                Start game
              </Link>
              <Link
                href="/games/example"
                prefetch={false}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Open game shell
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {featureRows.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[110px_1fr] items-center gap-4 border-b border-[#d9d0c0] py-4"
              >
                <span className="text-sm font-semibold text-[#766246]">
                  {label}
                </span>
                <span className="text-base font-medium text-[#25211c]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
