"use client";

// Submit button that disables itself and shows a pending label while its
// enclosing <form>'s Server Action is in flight — this is what prevents
// duplicate submissions (a double click can't fire the action twice) and
// gives visible pending-state feedback without any custom state wiring.
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
}

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
    >
      {pending ? (pendingLabel ?? "Please wait…") : children}
    </button>
  );
}
