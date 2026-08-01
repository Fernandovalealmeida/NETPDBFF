import type { Metadata } from "next";
import "./globals.css";

// The interface language is English at launch. The `lang` attribute is set
// statically here for now; when Portuguese support is introduced this will
// become dynamic (e.g. driven by a locale segment/middleware), per
// docs/architecture.md.
const LOCALE = "en";

export const metadata: Metadata = {
  title: "NetPDBFF",
  description:
    "The living human network of the Biological Dynamics of Forest Fragments Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LOCALE}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
