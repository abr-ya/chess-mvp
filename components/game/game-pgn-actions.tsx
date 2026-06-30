"use client";

import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";

type GamePgnActionsProps = {
  gameId: string;
};

export function GamePgnActions({ gameId }: GamePgnActionsProps) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const exportUrl = `/api/games/${encodeURIComponent(gameId)}/pgn`;

  async function copyPgn() {
    if (status === "copying") {
      return;
    }

    setStatus("copying");
    setErrorMessage(null);

    try {
      const response = await fetch(exportUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("The PGN could not be loaded.");
      }

      await navigator.clipboard.writeText(await response.text());
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch (error) {
      setStatus("idle");
      setErrorMessage(
        error instanceof Error ? error.message : "The PGN could not be copied.",
      );
    }
  }

  return (
    <div className="mt-6 border-t border-[#d9d0c0] pt-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#766246]">
        PGN
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" onClick={copyPgn} disabled={status === "copying"}>
          {status === "copying" ? "Copying…" : status === "copied" ? "Copied" : "Copy PGN"}
        </Button>
        <a href={exportUrl} className={buttonVariants({ variant: "outline" })}>
          Download .pgn
        </a>
      </div>
      {errorMessage ? (
        <p className="mt-3 text-sm font-medium text-red-700" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
