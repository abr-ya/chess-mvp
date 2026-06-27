import { SignIn } from "@clerk/nextjs";

export function SignInScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-5 py-10 text-[#171717]">
      <section className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#766246]">
          Authentication
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <div className="mt-8">
          <SignIn routing="path" path="/sign-in" />
        </div>
      </section>
    </main>
  );
}
