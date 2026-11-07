import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Content Engine - Clipper & Remixer",
  description: "Semi-automated short video creation studio with Remotion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
