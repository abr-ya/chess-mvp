import Link from "next/link";

import { PositionSetupScreen } from "@/components/position/position-setup-screen";

export default function AnalysisSetupPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-6 text-[#171717] sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 border-b border-[#d9d0c0] pb-5">
          <Link href="/" className="text-sm font-semibold text-[#766246]">
            Chess MVP
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#766246]">
            Position tools
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Set up a position
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#5d5548]">
            Build a position visually or load it from FEN. The editor checks
            kings, pawns, castling rights, and FEN structure before the position
            is handed to later analysis tools.
          </p>
        </header>

        <PositionSetupScreen />
      </div>
    </main>
  );
}
