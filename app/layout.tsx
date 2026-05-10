import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevFlow AI",
  description: "AI automation platform for dev agencies and recruiters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
