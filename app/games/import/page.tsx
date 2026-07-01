import Link from "next/link";

import { PgnImportInput } from "@/components/pgn/pgn-import-input";

export default function ImportPgnPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-6 text-[#171717] sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 border-b border-[#d9d0c0] pb-5">
          <Link href="/play" className="text-sm font-semibold text-[#766246]">
            ← Back to play
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#766246]">
            Game tools
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Import a PGN game
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#5d5548]">
            Load a PGN file or paste its contents. You will be able to review
            the game details and validation result before saving it.
          </p>
        </header>

        <PgnImportInput />
      </div>
    </main>
  );
}
