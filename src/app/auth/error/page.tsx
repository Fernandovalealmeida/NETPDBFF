import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Link problem — NetPDBFF",
};

export default function AuthErrorPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        This link didn&apos;t work
      </h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        The confirmation or password-reset link you followed is invalid or has expired. Links can
        only be used once and stop working after a while — request a new one below.
      </p>

      <div className="mt-8 flex flex-col gap-2 text-sm">
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100"
        >
          Go to log in
        </Link>
        <Link
          href="/register"
          className="font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100"
        >
          Create a new account
        </Link>
        <Link
          href="/forgot-password"
          className="font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100"
        >
          Request a new password-reset link
        </Link>
      </div>
    </main>
  );
}
