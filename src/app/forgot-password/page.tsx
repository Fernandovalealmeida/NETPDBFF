import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password — NetPDBFF",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Enter the email address for your account and we&apos;ll send you a link to choose a new
        password.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100"
        >
          Back to log in
        </Link>
      </p>
    </main>
  );
}
