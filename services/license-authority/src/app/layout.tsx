import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "cypher-compiler · licensing daemon",
  description: "Internal licensing daemon endpoint.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

/**
 * Theme boot script — runs before first paint to prevent FOUC.
 * Preference persists in localStorage under `ravenhub.theme`.
 */
const themeBoot = `
(function () {
  try {
    var t = localStorage.getItem("ravenhub.theme");
    if (t !== "light" && t !== "dark") {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
