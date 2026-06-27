import Link from "next/link";
import { AuthActions } from "@/components/auth/auth-actions";
import { buttonVariants } from "@/components/ui/button";

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-6 text-[#171717] sm:px-8 lg:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <div>
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold text-[#766246]">
              Chess MVP
            </Link>
            <AuthActions />
          </div>
          <h1 className="mt-6 text-4xl font-semibold">Play</h1>
          <p className="mt-4 text-base leading-7 text-[#5d5548]">
            This route is the primary entry point for creating a basic manual
            game during Feature 02.
          </p>
          <Link
            href="/games/example"
            className={buttonVariants({ className: "mt-8", size: "lg" })}
          >
            Open game shell
          </Link>
        </div>

        <div className="grid min-h-[420px] place-items-center border border-[#d9d0c0] bg-[#ede4d4] p-5">
          <div className="aspect-square w-full max-w-[520px] border border-[#987d54] bg-[linear-gradient(45deg,#b58863_25%,transparent_25%),linear-gradient(-45deg,#b58863_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#b58863_75%),linear-gradient(-45deg,transparent_75%,#b58863_75%)] bg-[length:25%_25%] bg-[position:0_0,0_12.5%,12.5%_-12.5%,_-12.5%_0]" />
        </div>
      </section>
    </main>
  );
}
