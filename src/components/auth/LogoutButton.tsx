import { logoutAction } from "@/features/auth/actions/logout";

interface LogoutButtonProps {
  className?: string;
}

// Server Component: renders a <form> that POSTs to a Server Action. This is
// the "logout must run server-side, not as an unsafe GET side effect"
// requirement — there is no link or onClick handler that triggers logout.
export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          className ??
          "text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        }
      >
        Log out
      </button>
    </form>
  );
}
