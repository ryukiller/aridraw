import "./globals.css";

import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your imagination at your pocket - AriDraw",
  description: "Unleash your inner artist with Creative Canvas a modern, responsive digital painting and drawing app. Experiment with multiple brush types, vibrant color palettes, and custom backgrounds. Save, revisit, and share your creative history with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
