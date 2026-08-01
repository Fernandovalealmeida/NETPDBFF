interface FormMessageProps {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}

// A single, restrained banner style used for error, success, and neutral
// informational states across every auth form, so the visual language
// stays consistent without needing a full design system. "info" is for
// states that are neither a failure nor a completion — e.g. "please log in
// again" (src/app/login/page.tsx).
export function FormMessage({ tone, children }: FormMessageProps) {
  const toneClasses =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
        : "border-neutral-300 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border px-4 py-3 text-sm ${toneClasses}`}
    >
      {children}
    </div>
  );
}
