"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { readJsonResponse } from "@/lib/game/game-client-http";

type CreateGameResponse = {
  game?: { id?: unknown };
  error?: { message?: unknown };
};

type NewGameButtonProps = {
  label?: string;
  className?: string;
};

export function NewGameButton({
  label = "New game",
  className,
}: NewGameButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function createGame() {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/games", { method: "POST" });
      const payload = (await readJsonResponse(response)) as CreateGameResponse | null;

      if (!response.ok) {
        throw new Error(
          typeof payload?.error?.message === "string"
            ? payload.error.message
            : "The game could not be created.",
        );
      }

      if (typeof payload?.game?.id !== "string") {
        throw new Error("The server returned an invalid game.");
      }

      router.push(`/games/${encodeURIComponent(payload.game.id)}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The game could not be created.",
      );
      setIsCreating(false);
    }
  }

  return (
    <div className={className}>
      <Button size="lg" onClick={createGame} disabled={isCreating}>
        {isCreating ? "Creating game…" : label}
      </Button>
      {errorMessage ? (
        <p className="mt-3 text-sm font-medium text-red-700" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
