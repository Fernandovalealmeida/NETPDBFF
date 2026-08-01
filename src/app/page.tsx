// Minimal, restrained landing page. This is deliberately not a final
// brand identity, dashboard, or marketing page — see docs/product-specification.md.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          NetPDBFF
        </h1>

        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400 sm:text-lg">
          The living human network of the Biological Dynamics of Forest
          Fragments Project
        </p>

        <p className="mt-10 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          This platform is under development. Content and functionality will
          be introduced progressively.
        </p>
      </div>
    </main>
  );
}
