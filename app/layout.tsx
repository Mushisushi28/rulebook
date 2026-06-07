import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rulebook — AI-grounded house rules for every family game",
  description: "Pick a game, read the full ruleset, and ask an AI grounded in that game's rules.",
};

export const viewport = {
  themeColor: "#0e0d0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
