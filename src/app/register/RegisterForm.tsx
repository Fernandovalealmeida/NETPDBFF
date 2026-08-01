"use client";

import { useActionState } from "react";

import { ResendConfirmationForm } from "@/components/auth/ResendConfirmationForm";
import { FormField } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { registerAction } from "@/features/auth/actions/register";
import { initialRegisterState } from "@/features/auth/actions/state";
import { PASSWORD_POLICY_HINT } from "@/lib/auth/password-policy";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialRegisterState);

  // Explicit "confirmation email sent" state.
  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-6">
        <FormMessage tone="success">
          Check your email to confirm your account. If that address can receive mail, we&apos;ve
          sent a confirmation link — it may take a minute to arrive. (Local development: open{" "}
          <strong>Mailpit</strong> to view it — see docs/authentication-implementation.md.)
        </FormMessage>

        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Didn&apos;t get it?
          </p>
          <div className="mt-3">
            <ResendConfirmationForm email={state.email} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.status === "error" && state.formError ? (
        <FormMessage tone="error">{state.formError}</FormMessage>
      ) : null}

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
        hint={PASSWORD_POLICY_HINT}
      />

      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="termsAccepted"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 dark:border-neutral-700"
            aria-describedby={state.fieldErrors?.termsAccepted ? "termsAccepted-error" : undefined}
          />
          <span>
            I agree to the Terms of Service and Privacy Notice. (Placeholder — NetPDBFF&apos;s
            final policies have not been published yet.)
          </span>
        </label>
        {state.fieldErrors?.termsAccepted ? (
          <p id="termsAccepted-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.fieldErrors.termsAccepted}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
    </form>
  );
}
